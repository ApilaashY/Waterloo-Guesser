import { PlayerStatus } from "../../types/GameType.js";
export async function handlePlayerReady(socket, sessionId, socketId, gameRooms) {
    const game = gameRooms[sessionId];
    // Debug logging
    console.log(`[PLAYER READY] Session: ${sessionId}, SocketId: ${socketId}`);
    if (!game) {
        console.error(`[PLAYER READY] Game session not found: ${sessionId}. Available rooms: ${Object.keys(gameRooms)}`);
        return;
    }
    console.log(`[PLAYER READY] Current game state - P1: ${game.player1Id} (${game.player1Status}), P2: ${game.player2Id} (${game.player2Status}), started: ${game.started}`);
    // Update status for the player who sent the ready event
    if (game.player1Id == socketId) {
        console.log(`[PLAYER READY] Player 1 (${socketId}) is ready`);
        game.player1Status = PlayerStatus.READY;
    }
    else if (game.player2Id == socketId) {
        console.log(`[PLAYER READY] Player 2 (${socketId}) is ready`);
        game.player2Status = PlayerStatus.READY;
    }
    else {
        // Socket ID doesn't match - try to recover by checking which player slot is stale
        const io = socket.server;
        const player1Socket = io.sockets.sockets.get(game.player1Id);
        const player2Socket = io.sockets.sockets.get(game.player2Id);
        if (!player1Socket) {
            console.log(`[PLAYER READY] Player 1 socket stale, updating to new socket ID: ${socketId} (was: ${game.player1Id})`);
            game.player1Id = socketId;
            game.player1Status = PlayerStatus.READY;
        }
        else if (!player2Socket) {
            console.log(`[PLAYER READY] Player 2 socket stale, updating to new socket ID: ${socketId} (was: ${game.player2Id})`);
            game.player2Id = socketId;
            game.player2Status = PlayerStatus.READY;
        }
        else {
            console.error(`[PLAYER READY] Socket ID ${socketId} does not match any player in game ${sessionId}`);
            console.error(`[PLAYER READY] Expected: P1=${game.player1Id}, P2=${game.player2Id}`);
            return;
        }
    }
    // Notify other player that this player is ready (optional, but good for UI)
    // For now, we can rely on the fact that if both are ready, game starts. 
    // Ideally, we should emit a 'playerStatusUpdate' but to keep it simple and follow existing patterns:
    console.log(`[PLAYER READY] After update - P1: ${game.player1Id} (${game.player1Status}), P2: ${game.player2Id} (${game.player2Status}), started: ${game.started}`);
    // If both players are READY, start the game
    if (game.player1Status === PlayerStatus.READY &&
        game.player2Status === PlayerStatus.READY &&
        !game.started) {
        game.started = true;
        console.log(`[GAME START] Session ${sessionId} starting. Both players ready.`);
        // Notify both players that the game is starting
        const io = socket.server;
        // Find and emit to player 1
        const player1Socket = io.sockets.sockets.get(game.player1Id);
        const player1Filtered = game.filterForPlayer({ player1: true });
        // Find and emit to player 2
        const player2Socket = io.sockets.sockets.get(game.player2Id);
        const player2Filtered = game.filterForPlayer({ player1: false });
        console.log(`[GAME START] Emitting roundStart - P1 socket found: ${!!player1Socket}, P2 socket found: ${!!player2Socket}`);
        if (player1Socket) {
            player1Socket.emit("roundStart", player1Filtered);
            console.log(`[GAME START] Emitted roundStart to player 1 (${game.player1Id})`);
        }
        else {
            console.error(`[GAME START] Failed to find player 1 socket: ${game.player1Id}`);
        }
        if (player2Socket) {
            player2Socket.emit("roundStart", player2Filtered);
            console.log(`[GAME START] Emitted roundStart to player 2 (${game.player2Id})`);
        }
        else {
            console.error(`[GAME START] Failed to find player 2 socket: ${game.player2Id}`);
        }
    }
    else {
        console.log(`[PLAYER READY] Waiting for other player. P1 ready: ${game.player1Status === PlayerStatus.READY}, P2 ready: ${game.player2Status === PlayerStatus.READY}, started: ${game.started}`);
        // Notify partner that opponent is ready
        const io = socket.server;
        const isPlayer1 = game.player1Id == socketId;
        const partnerId = isPlayer1 ? game.player2Id : game.player1Id;
        const partnerSocket = io.sockets.sockets.get(partnerId);
        const partnerStatus = isPlayer1 ? game.player2Status : game.player1Status;
        // Notify partner that this player is ready
        if (partnerSocket) {
            partnerSocket.emit("partnerReady", { ready: true });
            console.log(`[PLAYER READY] Notified partner (${partnerId}) that opponent is ready`);
        }
        else {
            console.log(`[PLAYER READY] Partner socket not found for notification: ${partnerId}`);
        }
        // If partner was already ready, notify this player
        if (partnerStatus === PlayerStatus.READY) {
            socket.emit("partnerReady", { ready: true });
            console.log(`[PLAYER READY] Notified current player (${socketId}) that partner was already ready`);
        }
    }
}
