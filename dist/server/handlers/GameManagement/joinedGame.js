import { PlayerStatus } from "../../types/GameType.js";
// This function changes the game room's player status to ready when they join
export async function handleJoinedGame(socket, sessionId, socketId, gameRooms) {
    const game = gameRooms[sessionId];
    if (!game) {
        console.error("[JOINED GAME] Game session not found:", sessionId);
        return;
    }
    console.log(`[JOINED GAME] Session: ${sessionId}, SocketId: ${socketId}`);
    console.log(`[JOINED GAME] Game player1Id: ${game.player1Id}, player2Id: ${game.player2Id}`);
    // Check if socketId matches either player directly, or if this is a reconnection
    // where the partnerId from URL params matches one of the stored IDs
    if (game.player1Id == socketId) {
        game.player1Status = PlayerStatus.ACTIVE;
        console.log(`[JOINED GAME] Player 1 (${socketId}) joined with ACTIVE status`);
    }
    else if (game.player2Id == socketId) {
        game.player2Status = PlayerStatus.ACTIVE;
        console.log(`[JOINED GAME] Player 2 (${socketId}) joined with ACTIVE status`);
    }
    else {
        // Socket ID doesn't match - this could be a reconnection with new socket ID
        // Try to identify which player this is by checking if one slot has a stale socket
        const io = socket.server;
        const player1Socket = io.sockets.sockets.get(game.player1Id);
        const player2Socket = io.sockets.sockets.get(game.player2Id);
        if (!player1Socket && game.player1Status !== PlayerStatus.READY) {
            // Player 1's socket is stale, this must be player 1 reconnecting
            console.log(`[JOINED GAME] Player 1 reconnected with new socket ID: ${socketId} (was: ${game.player1Id})`);
            game.player1Id = socketId;
            game.player1Status = PlayerStatus.ACTIVE;
        }
        else if (!player2Socket && game.player2Status !== PlayerStatus.READY) {
            // Player 2's socket is stale, this must be player 2 reconnecting
            console.log(`[JOINED GAME] Player 2 reconnected with new socket ID: ${socketId} (was: ${game.player2Id})`);
            game.player2Id = socketId;
            game.player2Status = PlayerStatus.ACTIVE;
        }
        else {
            console.error(`[JOINED GAME] Socket ID ${socketId} does not match any player in game ${sessionId}`);
            console.error(`[JOINED GAME] Expected: P1=${game.player1Id} (connected: ${!!player1Socket}), P2=${game.player2Id} (connected: ${!!player2Socket})`);
            return;
        }
    }
}
