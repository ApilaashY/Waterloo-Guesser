import { GameType, PlayerStatus } from "../../types/GameType.js";

export async function handlePlayerReady(
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

    // Update status for the player who sent the ready event
    if (game.player1Id == socketId) {
        game.player1Status = PlayerStatus.READY;
    } else if (game.player2Id == socketId) {
        game.player2Status = PlayerStatus.READY;
    } else {
        console.error("Socket ID does not match any player in the game.");
        return;
    }

    // If both players are READY, start the game
    if (
        game.player1Status === PlayerStatus.READY &&
        game.player2Status === PlayerStatus.READY &&
        !game.started
    ) {
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

        if (player1Socket) {
            player1Socket.emit("roundStart", player1Filtered);
        }
        if (player2Socket) {
            player2Socket.emit("roundStart", player2Filtered);
        }
    } else {
        // Notify partner that opponent is ready (optional, but good for UI)
        const io = socket.server;
        const isPlayer1 = game.player1Id == socketId;
        const partnerId = isPlayer1 ? game.player2Id : game.player1Id;
        const partnerSocket = io.sockets.sockets.get(partnerId);

        if (partnerSocket) {
            partnerSocket.emit("partnerReady", { ready: true });
        }
    }
}
