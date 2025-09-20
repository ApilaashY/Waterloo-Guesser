import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import your existing handlers
import { handleAddToQueue } from '../server/handlers/QueueManagement/addToQueue.js';
import { handleJoinedGame } from '../server/handlers/GameManagement/joinedGame.js';
import { handleSubmitGuess } from '../server/handlers/GameManagement/submitGuess.js';
import { GameType } from '../server/types/GameType.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for health checks and any HTTP endpoints
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-domain.vercel.app', // Replace with your Vercel domain
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true
}));

app.use(express.json());

// Health check endpoint for AWS Load Balancer
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Waterloo Guesser WebSocket Server', version: '1.0.0' });
});

const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://your-vercel-domain.vercel.app', // Replace with your Vercel domain
      'https://*.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingInterval: 60000, // 60 seconds
  pingTimeout: 240000  // 4 minutes (must be > ALB idle timeout)
});

// Game state storage
const queue = [];
const gameRooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id} at ${new Date().toISOString()}`);

  // Queue management
  socket.on('joinQueue', (data) => {
    console.log(`User ${socket.id} joining queue`);
    handleAddToQueue(queue, socket, gameRooms);
  });

  // Game management
  socket.on('joinedGame', (data) => {
    console.log(`User ${socket.id} joining game:`, data.sessionId);
    handleJoinedGame(socket, data.sessionId, data.socketId, gameRooms);
  });

  socket.on('submitGuess', (data) => {
    console.log(`User ${socket.id} submitting guess for session:`, data.sessionId);
    handleSubmitGuess(
      socket,
      data.x,
      data.y,
      data.sessionId,
      socket.id,
      gameRooms
    );
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    
    // Clean up user from queue if they were waiting
    const queueIndex = queue.findIndex(s => s.id === socket.id);
    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
      console.log(`Removed ${socket.id} from queue`);
    }

    // Clean up game rooms if needed
    Object.keys(gameRooms).forEach(sessionId => {
      const game = gameRooms[sessionId];
      if (game && (game.userId === socket.id || game.partnerSessionId === socket.id)) {
        delete gameRooms[sessionId];
        console.log(`Cleaned up game room: ${sessionId}`);
      }
    });
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
  });
});

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`WebSocket server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
});
