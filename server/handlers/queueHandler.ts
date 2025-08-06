import { matchService } from '../services/matchService.js';

export function handleQueue(socket: any) {
  socket.on("joinQueue", (_msg: any, callback: any) => {
    const result = matchService.createMatch(socket);
    if (callback) callback(result);
  });

  socket.on("restoreSession", (existingSessionId: string, callback: any) => {
    const result = matchService.restoreSession(existingSessionId, socket);
    if (callback) callback(result);
  });
}
