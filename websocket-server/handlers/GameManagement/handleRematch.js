import { GameType } from "../../types/GameType.js";

export async function handleRematch(
    socket,
    io,
    sessionId,
    socketId,
    gameRooms
) {
    const game = gameRooms[sessionId];

    if (!game) {
        console.error(`[REMATCH] Game session not found: ${sessionId}`);
        socket.emit("rematchError", { error: "Game session not found" });
        return;
    }

    // Determine which player is requesting rematch
    const isPlayer1 = game.player1Id === socketId;
    const isPlayer2 = game.player2Id === socketId;

    if (!isPlayer1 && !isPlayer2) {
        console.error(`[REMATCH] Player ${socketId} is not in game ${sessionId}`);
        socket.emit("rematchError", { error: "You are not in this game" });
        return;
    }

    // Mark player's rematch request
    if (isPlayer1) {
        game.rematchRequested.player1 = true;
        console.log(`[REMATCH] Player 1 (${socketId}) requested rematch for session ${sessionId}`);
    } else {
        game.rematchRequested.player2 = true;
        console.log(`[REMATCH] Player 2 (${socketId}) requested rematch for session ${sessionId}`);
    }

    // Get both player sockets
    const player1Socket = io.sockets.sockets.get(game.player1Id);
    const player2Socket = io.sockets.sockets.get(game.player2Id);

    // Notify both players of the rematch request status
    const rematchStatus = {
        player1Requested: game.rematchRequested.player1,
        player2Requested: game.rematchRequested.player2,
    };

    if (player1Socket) {
        player1Socket.emit("rematchStatus", rematchStatus);
    }
    if (player2Socket) {
        player2Socket.emit("rematchStatus", rematchStatus);
    }

    // If both players requested rematch, start the rematch
    if (game.rematchRequested.player1 && game.rematchRequested.player2) {
        console.log(`[REMATCH] Both players agreed to rematch for session ${sessionId}`);

        // Reset game state
        await game.resetForRematch();

        // Notify both players that rematch is starting
        if (player1Socket) {
            player1Socket.emit("rematchStarting");
        }
        if (player2Socket) {
            player2Socket.emit("rematchStarting");
        }

        // Send the new game state to both players
        if (player1Socket) {
            player1Socket.emit("roundStart", game.filterForPlayer({ player1: true }));
        }
        if (player2Socket) {
            player2Socket.emit("roundStart", game.filterForPlayer({ player1: false }));
        }

        console.log(`[REMATCH] Rematch started for session ${sessionId}`);
    }
}
