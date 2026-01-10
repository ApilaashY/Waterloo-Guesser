import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { handleAddToQueue } from "./handlers/QueueManagement/addToQueue.js";
import { handleJoinedGame } from "./handlers/GameManagement/joinedGame.js";
import { handleSubmitGuess } from "./handlers/GameManagement/submitGuess.js";
import { handlePlayerReady } from "./handlers/GameManagement/playerReady.js";
import { handleRematch } from "./handlers/GameManagement/handleRematch.js";
const dev = process.env.NODE_ENV !== "production";
const hostName = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname: hostName, port });
const handle = app.getRequestHandler();
const queue = [];
const gameRooms = {};
// Function to broadcast player stats to all clients
function broadcastPlayerStats(io) {
    const inQueue = queue.length;
    const inMatch = Object.keys(gameRooms).length * 2; // Each game has 2 players
    io.emit("playerStats", { inQueue, inMatch });
    console.log(`[STATS] Broadcasting: ${inQueue} in queue, ${inMatch} in match`);
}
app.prepare().then(() => {
    const httpServer = createServer(handle);
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        allowEIO3: true,
    });
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        // Send initial player stats to the newly connected client
        const inQueue = queue.length;
        const inMatch = Object.keys(gameRooms).length * 2;
        socket.emit("playerStats", { inQueue, inMatch });
        // Handle request for player stats
        socket.on("requestPlayerStats", () => {
            const inQueue = queue.length;
            const inMatch = Object.keys(gameRooms).length * 2;
            socket.emit("playerStats", { inQueue, inMatch });
        });
        // Set up all socket event handlers
        // Queue management
        socket.on("joinQueue", (data) => {
            handleAddToQueue(queue, socket, gameRooms, io, data?.modifier);
            broadcastPlayerStats(io);
        });
        // Leave queue handler
        socket.on("leaveQueue", () => {
            const index = queue.findIndex(entry => entry.socket.id === socket.id);
            if (index !== -1) {
                queue.splice(index, 1);
                console.log(`[QUEUE] User ${socket.id} left queue. Queue length: ${queue.length}`);
                broadcastPlayerStats(io);
            }
        });
        // Game management
        socket.on("joinedGame", (data) => handleJoinedGame(socket, data.sessionId, data.socketId, gameRooms));
        socket.on("playerReady", (data) => handlePlayerReady(socket, data.sessionId, socket.id, gameRooms));
        socket.on("submitGuess", (data) => handleSubmitGuess(socket, data.x, data.y, data.sessionId, socket.id, gameRooms));
        // Rematch handling
        socket.on("requestRematch", (data) => handleRematch(socket, io, data.sessionId, socket.id, gameRooms));
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            // Remove from queue if they were waiting
            const queueIndex = queue.findIndex(entry => entry.socket.id === socket.id);
            if (queueIndex !== -1) {
                queue.splice(queueIndex, 1);
                console.log(`[DISCONNECT] Removed ${socket.id} from queue. Queue length: ${queue.length}`);
            }
            // Check if the disconnected user was in a game
            Object.entries(gameRooms).forEach(([sessionId, game]) => {
                const isPlayer1 = game.player1Id === socket.id;
                const isPlayer2 = game.player2Id === socket.id;
                if (isPlayer1 || isPlayer2) {
                    console.log(`[DISCONNECT] Player ${socket.id} disconnected from session ${sessionId}`);
                    // Notify the other player
                    const otherPlayerId = isPlayer1 ? game.player2Id : game.player1Id;
                    const otherPlayerSocket = io.sockets.sockets.get(otherPlayerId);
                    if (otherPlayerSocket) {
                        // Check if game is in specific states that need notification
                        if (game.rematchRequested.player1 || game.rematchRequested.player2) {
                            // During rematch request
                            otherPlayerSocket.emit("opponentDisconnected");
                            console.log(`[DISCONNECT] Notified ${otherPlayerId} that opponent left during rematch`);
                        }
                        else if (game.currentRoundIndex >= 4) {
                            // After game over (waiting in results screen)
                            otherPlayerSocket.emit("opponentDisconnected");
                            console.log(`[DISCONNECT] Notified ${otherPlayerId} that opponent left after game`);
                        }
                    }
                }
            });
            // Broadcast updated stats after disconnect
            broadcastPlayerStats(io);
        });
    });
    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostName}:${port}`);
    });
});
