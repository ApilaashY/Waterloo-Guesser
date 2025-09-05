import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { handleAddToQueue } from "./handlers/addToQueue.js";

const dev = process.env.NODE_ENV !== "production";
const hostName = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname: hostName, port });
const handle = app.getRequestHandler();

const queue: any[] = [];

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  io.on("connection", (socket: any) => {
    // Set up all socket event handlers

    socket.on("joinQueue", (data: any) => handleAddToQueue(queue, socket));
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostName}:${port}`);
  });
});
