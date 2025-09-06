import { GameType, PlayerStatus } from "../../types/GameType.js";

// This function changes the game room's player status to ready when they join
export async function handleJoinedGame(
  socket: any,
  sessionId: string,
  socketId: string,
  gameRooms: { [key: string]: GameType }
) {
  const game = gameRooms[sessionId];

  if (!game) {
    console.error("Game session not found:", sessionId);
    return;
  }

  if (game.player1Id == socketId) {
    game.player1Status = PlayerStatus.ACTIVE;
  } else if (game.player2Id == socketId) {
    game.player2Status = PlayerStatus.ACTIVE;
  } else {
    console.error("Socket ID does not match any player in the game.");
    return;
  }

  // If both players are active, start the game if not started yet
  if (
    game.player1Status === PlayerStatus.ACTIVE &&
    game.player2Status === PlayerStatus.ACTIVE &&
    !game.started
  ) {
    game.started = true;
    console.log(game);

    // Notify both players that the game is starting
    // We need to emit to the socket server's connected sockets
    const io = socket.server;

    // Find and emit to player 1
    const player1Socket = io.sockets.sockets.get(game.player1Id);
    const player1Filtered = game.filterForPlayer({ player1: true });

    // Find and emit to player 2
    const player2Socket = io.sockets.sockets.get(game.player2Id);
    const player2Filtered = game.filterForPlayer({ player1: false });

    if (player1Socket) {
      player1Socket.emit("roundStart", player1Filtered);
    }
    if (player2Socket) {
      player2Socket.emit("roundStart", player2Filtered);
    }
  }
}
