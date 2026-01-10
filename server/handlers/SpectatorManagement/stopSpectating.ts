import { GameType } from "../../types/GameType";

export function handleStopSpectating(
  socket: any,
  sessionId: string,
  gameRooms: { [key: string]: GameType }
): void {
  const game = gameRooms[sessionId];

  if (!game) {
    console.error(`[STOP SPECTATE] Game session not found: ${sessionId}`);
    return;
  }

  // Remove spectator from game
  game.removeSpectator(socket.id);

  // Leave Socket.IO room
  socket.leave(`spectator:${sessionId}`);

  console.log(`[STOP SPECTATE] ${socket.id} left session ${sessionId}`);
}
