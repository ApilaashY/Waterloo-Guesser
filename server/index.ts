import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { handleConnection } from './handlers/connectionHandler.js';
import { handleQueue } from './handlers/queueHandler.js';
import { handleGame } from './handlers/gameHandler.js';
import { handleValidation } from './handlers/validationHandler.js';
import { debugLog } from './utils/debug.js';

const dev = process.env.NODE_ENV !== "production";
const hostName = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname: hostName, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    allowEIO3: true
  });

  io.on("connection", (socket: any) => {
    // Set up all socket event handlers
    handleConnection(socket, io);
    handleQueue(socket);
    handleGame(socket);
    handleValidation(socket);
  });

  httpServer.listen(port, () => {
    debugLog(`> Ready on http://${hostName}:${port}`);
  });
});
