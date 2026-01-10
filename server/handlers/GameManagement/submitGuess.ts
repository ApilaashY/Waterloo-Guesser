import { GameType } from "../../types/GameType.js";

// Constants for timed mode scoring
const MAX_TIME_BONUS = 500; // Maximum bonus points for being first
const TIME_PRESSURE_WINDOW = 15000; // 15 seconds window for time pressure after opponent submits
const BASE_POINTS_MAX = 1000; // Maximum base points for accuracy

// Function to calculate points based on guess accuracy
export function calculatePoints(
  xCoor: number,
  yCoor: number,
  correctX: number,
  correctY: number
): number {
  // Calculate points based on distance (simple Euclidean for now)
  const dx = xCoor - correctX!;
  const dy = yCoor - correctY!;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Example scoring: max 1000, lose 2000 per 0.1 distance
  const points = Math.max(0, Math.round(BASE_POINTS_MAX - distance * 2000));
  return points;
}

// Function to calculate time bonus for timed mode
// The first player to submit gets a bonus, second player's bonus decreases based on delay
export function calculateTimeBonus(
  playerSubmitTime: number,
  opponentSubmitTime: number | null
): number {
  // If opponent hasn't submitted yet, player submitted first - full bonus
  if (opponentSubmitTime === null) {
    return MAX_TIME_BONUS;
  }

  // If player submitted first (their time is earlier), they get full bonus
  if (playerSubmitTime < opponentSubmitTime) {
    return MAX_TIME_BONUS;
  }

  // Player submitted after opponent - calculate reduced bonus based on delay
  const delay = playerSubmitTime - opponentSubmitTime;

  // Linear decay: full bonus at 0 delay, 0 bonus at TIME_PRESSURE_WINDOW (15s)
  const bonusRatio = Math.max(0, 1 - (delay / TIME_PRESSURE_WINDOW));
  return Math.round(MAX_TIME_BONUS * bonusRatio);
}

// This function handles a player's guess submission
export async function handleSubmitGuess(
  socket: any,
  xCoor: number,
  yCoor: number,
  sessionId: string,
  socketId: string,
  gameRooms: { [key: string]: GameType }
) {
  const game = gameRooms[sessionId];

  if (!game) {
    console.error("Game session not found:", sessionId);
    return;
  }

  const io = socket.server;
  const player1Socket = io.sockets.sockets.get(game.player1Id);
  const player2Socket = io.sockets.sockets.get(game.player2Id);

  const submitTime = Date.now();
  const basePoints = calculatePoints(xCoor, yCoor, game.answer.x, game.answer.y);

  if (game.player1Id == socketId) {
    game.player1Guess = { x: xCoor, y: yCoor };
    game.player1SubmitTime = submitTime;

    // Calculate points (base + time bonus if timed mode)
    let points = basePoints;
    let timeBonus = 0;
    if (game.timedMode) {
      timeBonus = calculateTimeBonus(submitTime, game.player2SubmitTime);
      points += timeBonus;
      console.log(`[TIMED] Player 1 submitted. Base: ${basePoints}, Time bonus: ${timeBonus}, Total: ${points}`);
    }

    // Notify both players of player 1's points
    if (player1Socket) {
      player1Socket.emit("playerPoints", {
        points: game.player1Points + points,
        timeBonus: game.timedMode ? timeBonus : undefined,
      });
    }
    if (player2Socket) {
      player2Socket.emit("partnerPoints", {
        points: game.player1Points + points,
      });
      // Notify player 2 that player 1 has submitted - include timestamp for pressure timer
      player2Socket.emit("partnerSubmitted", {
        submittedAt: game.timedMode ? submitTime : undefined,
      });
    }
  } else if (game.player2Id == socketId) {
    game.player2Guess = { x: xCoor, y: yCoor };
    game.player2SubmitTime = submitTime;

    // Calculate points (base + time bonus if timed mode)
    let points = basePoints;
    let timeBonus = 0;
    if (game.timedMode) {
      timeBonus = calculateTimeBonus(submitTime, game.player1SubmitTime);
      points += timeBonus;
      console.log(`[TIMED] Player 2 submitted. Base: ${basePoints}, Time bonus: ${timeBonus}, Total: ${points}`);
    }

    // Notify both players of player 2's points
    if (player1Socket) {
      player1Socket.emit("partnerPoints", {
        points: game.player2Points + points,
      });
      // Notify player 1 that player 2 has submitted - include timestamp for pressure timer
      player1Socket.emit("partnerSubmitted", {
        submittedAt: game.timedMode ? submitTime : undefined,
      });
    }
    if (player2Socket) {
      player2Socket.emit("playerPoints", {
        points: game.player2Points + points,
        timeBonus: game.timedMode ? timeBonus : undefined,
      });
    }
  } else {
    console.error("Socket ID does not match any player in the game.");
    return;
  }

  console.log(game);

  // If both players have made their guesses, reveal the answer and update points
  if (game.player1Guess != null && game.player2Guess != null) {
    // Calculate base points based on guesses
    const player1BasePoints = calculatePoints(
      game.player1Guess.x,
      game.player1Guess.y,
      game.answer.x,
      game.answer.y
    );
    const player2BasePoints = calculatePoints(
      game.player2Guess.x,
      game.player2Guess.y,
      game.answer.x,
      game.answer.y
    );

    // Add time bonuses if timed mode
    let player1TimeBonus = 0;
    let player2TimeBonus = 0;
    if (game.timedMode && game.player1SubmitTime && game.player2SubmitTime) {
      player1TimeBonus = calculateTimeBonus(game.player1SubmitTime, game.player2SubmitTime);
      player2TimeBonus = calculateTimeBonus(game.player2SubmitTime, game.player1SubmitTime);
      console.log(`[TIMED] Final bonuses - P1: ${player1TimeBonus}, P2: ${player2TimeBonus}`);
    }

    game.player1Points += player1BasePoints + player1TimeBonus;
    game.player2Points += player2BasePoints + player2TimeBonus;

    // Calculate raw distances for statistics
    const dx1 = game.player1Guess.x - game.answer.x;
    const dy1 = game.player1Guess.y - game.answer.y;
    const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    const dx2 = game.player2Guess.x - game.answer.x;
    const dy2 = game.player2Guess.y - game.answer.y;
    const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    // Update Global Statistics in MongoDB
    (async () => {
      try {
        // Fix: Correct relative path to lib/mongodb
        const { getDb } = await import("../../../lib/mongodb.js");
        const { ObjectId } = await import("mongodb");
        const db = await getDb();
        const collection = db.collection("base_locations");

        if (game.imageId) {
          const bestDistanceInRound = Math.min(distance1, distance2);

          await collection.updateOne(
            { _id: new ObjectId(game.imageId) },
            {
              $inc: {
                totalPlays: 2, // 2 players played this image
                totalDistance: distance1 + distance2
              },
              $min: { bestGuessDistance: bestDistanceInRound },
              $set: { lastPlayedAt: new Date() }
            }
          );
          console.log(`[STATS] Updated stats for image ${game.imageId}. Plays +2, Dist +${distance1 + distance2}`);
        }
      } catch (err) {
        console.error("[STATS] Failed to update location statistics:", err);
      }
    })();

    // Notify both players that the game is over and send results

    // Find and emit to player 1
    const player1Unfiltered = game.nonFilterForPlayer({ player1: true });

    // Find and emit to player 2

    const player2Unfiltered = game.nonFilterForPlayer({ player1: false });

    if (player1Socket) {
      player1Socket.emit("roundOver", player1Unfiltered);
    }
    if (player2Socket) {
      player2Socket.emit("roundOver", player2Unfiltered);
    }

    console.log("Sent results back to players");

    // Prepare for next round
    setTimeout(async () => {
      const io = socket.server;
      const player1Socket = io.sockets.sockets.get(game.player1Id);
      const player2Socket = io.sockets.sockets.get(game.player2Id);

      // End the game after 5 rounds (indices 0-4)
      // Check happens before nextRound() increment, so end when currentRoundIndex is 4
      if (game.currentRoundIndex >= 4) {
        console.log(
          `[GAME OVER] Round index ${game.currentRoundIndex} >= 4. Ending game.`
        );
        // Figure out the winner
        const winner: string =
          game.player1Points > game.player2Points
            ? game.player1Id
            : game.player2Id;
        const tie: boolean = game.player1Points === game.player2Points;

        // Notify both players that the game is over
        if (player1Socket) {
          player1Socket.emit("gameOver", { winner: winner, tie: tie });
        }
        if (player2Socket) {
          player2Socket.emit("gameOver", { winner: winner, tie: tie });
        }
        return;
      }

      console.log(
        `[NEXT ROUND] Proceeding to next round from index ${game.currentRoundIndex}`
      );

      // Reset Game
      await game.nextRound();

      console.log(`[NEXT ROUND] New Round Index: ${game.currentRoundIndex}`);

      // Find and emit to player 1
      const player1Filtered = game.filterForPlayer({ player1: true });

      // Find and emit to player 2
      const player2Filtered = game.filterForPlayer({ player1: false });

      if (player1Socket) {
        player1Socket.emit("roundStart", player1Filtered);
      }
      if (player2Socket) {
        player2Socket.emit("roundStart", player2Filtered);
      }

      console.log("Started next round");

      console.log(game.imageUrl);
    }, 5000); // 5 second delay before next round
  }
}
