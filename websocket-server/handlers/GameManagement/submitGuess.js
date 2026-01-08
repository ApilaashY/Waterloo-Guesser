import { GameType } from "../../types/GameType.js";

// Function to calculate points based on guess accuracy
export function calculatePoints(
  xCoor,
  yCoor,
  correctX,
  correctY
) {
  // Calculate points based on distance (simple Euclidean for now)
  const dx = xCoor - correctX;
  const dy = yCoor - correctY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Example scoring: max 1000, lose 2000 per 0.1 distance
  const points = Math.max(0, Math.round(1000 - distance * 2000));
  return points;
}

// This function handles a player's guess submission
export async function handleSubmitGuess(
  socket,
  xCoor,
  yCoor,
  sessionId,
  socketId,
  gameRooms
) {
  const game = gameRooms[sessionId];

  if (!game) {
    console.error("Game session not found:", sessionId);
    return;
  }

  const io = socket.server;
  const player1Socket = io.sockets.sockets.get(game.player1Id);
  const player2Socket = io.sockets.sockets.get(game.player2Id);

  const points = calculatePoints(xCoor, yCoor, game.answer.x, game.answer.y);

  if (game.player1Id == socketId) {
    game.player1Guess = { x: xCoor, y: yCoor };

    // Notify both players of player 1's points
    if (player1Socket) {
      player1Socket.emit("playerPoints", {
        points: game.player1Points + points,
      });
    }
    if (player2Socket) {
      player2Socket.emit("partnerPoints", {
        points: game.player1Points + points,
      });
      // Notify player 2 that player 1 has submitted
      player2Socket.emit("partnerSubmitted");
    }
  } else if (game.player2Id == socketId) {
    game.player2Guess = { x: xCoor, y: yCoor };

    // Notify both players of player 2's points
    if (player1Socket) {
      player1Socket.emit("partnerPoints", {
        points: game.player2Points + points,
      });
      // Notify player 1 that player 2 has submitted
      player1Socket.emit("partnerSubmitted");
    }
    if (player2Socket) {
      player2Socket.emit("playerPoints", {
        points: game.player2Points + points,
      });
    }
  } else {
    console.error("Socket ID does not match any player in the game.");
    return;
  }

  console.log(game);

  // If both players have made their guesses, reveal the answer and update points
  if (game.player1Guess != null && game.player2Guess != null) {
    // Calculate points based on guesses
    game.player1Points += calculatePoints(
      game.player1Guess.x,
      game.player1Guess.y,
      game.answer.x,
      game.answer.y
    );
    game.player2Points += calculatePoints(
      game.player2Guess.x,
      game.player2Guess.y,
      game.answer.x,
      game.answer.y
    );

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

      console.log(`[ROUND CHECK] Current Round Index: ${game.currentRoundIndex}`);

      // End the game if the round is 4 (5 rounds total)
      if (game.currentRoundIndex >= 4) {
        console.log(`[GAME OVER] Round index ${game.currentRoundIndex} >= 4. Ending game.`);
        // Figure out the winner
        const winner =
          game.player1Points > game.player2Points
            ? game.player1Id
            : game.player2Id;
        const tie = game.player1Points === game.player2Points;

        // Notify both players that the game is over
        if (player1Socket) {
          player1Socket.emit("gameOver", { winner: winner, tie: tie });
        }
        if (player2Socket) {
          player2Socket.emit("gameOver", { winner: winner, tie: tie });
        }
        return;
      }

      console.log(`[NEXT ROUND] Proceeding to next round from index ${game.currentRoundIndex}`);

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
