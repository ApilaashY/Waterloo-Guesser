import { GameType, PlayerStatus } from "../../types/GameType.js";

// This function changes the game room's player status to ready when they join
export async function handleJoinedGame(
  socket,
  sessionId,
  socketId,
  gameRooms
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
}
