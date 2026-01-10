export function handleSpectateMatch(socket, sessionId, gameRooms) {
    const game = gameRooms[sessionId];
    if (!game) {
        console.error(`[SPECTATE] Game session not found: ${sessionId}`);
        return { success: false, error: "Game session not found" };
    }
    if (!game.started) {
        console.error(`[SPECTATE] Game has not started yet: ${sessionId}`);
        return { success: false, error: "Game has not started yet" };
    }
    // Add spectator to game
    game.addSpectator(socket.id);
    // Join Socket.IO room for spectator broadcasts
    socket.join(`spectator:${sessionId}`);
    console.log(`[SPECTATE] ${socket.id} joined session ${sessionId} as spectator`);
    return {
        success: true,
        gameState: game.getSpectatorView(),
    };
}
