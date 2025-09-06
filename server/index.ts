import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { handleAddToQueue } from "./handlers/QueueManagement/addToQueue.js";
import { GameType } from "./types/GameType.js";
import { handleJoinedGame } from "./handlers/GameManagement/joinedGame.js";
import { handleSubmitGuess } from "./handlers/GameManagement/submitGuess.js";

const dev = process.env.NODE_ENV !== "production";
const hostName = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname: hostName, port });
const handle = app.getRequestHandler();

const queue: any[] = [];
const gameRooms: { [key: string]: GameType } = {};

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

  io.on("connection", (socket: any) => {
    console.log("User connected:", socket.id);

    // Set up all socket event handlers

    // Queue management
    socket.on("joinQueue", (data: any) =>
      handleAddToQueue(queue, socket, gameRooms)
    );

    // Game management
    socket.on("joinedGame", (data: { sessionId: string; socketId: string }) =>
      handleJoinedGame(socket, data.sessionId, data.socketId, gameRooms)
    );
    socket.on(
      "submitGuess",
      (data: { x: number; y: number; sessionId: string }) =>
        handleSubmitGuess(
          socket,
          data.x,
          data.y,
          data.sessionId,
          socket.id,
          gameRooms
        )
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostName}:${port}`);
  });
});
