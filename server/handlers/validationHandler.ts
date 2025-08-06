import { validationService } from '../services/validationService.js';

export function handleValidation(socket: any) {
  socket.on("validateCoordinates", async ({ x, y, sessionId, partnerId }: { x: number, y: number, sessionId: string, partnerId: string }, callback: any) => {
    const result = await validationService.validateCoordinates(x, y, sessionId, partnerId, socket);
    
    if (callback) {
      callback(result);
    }
  });
}
