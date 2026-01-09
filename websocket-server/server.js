import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import your existing handlers
import { handleAddToQueue } from './handlers/QueueManagement/addToQueue.js';
import { handleJoinedGame } from './handlers/GameManagement/joinedGame.js';
import { handlePlayerReady } from './handlers/GameManagement/playerReady.js';
import { handleSubmitGuess } from './handlers/GameManagement/submitGuess.js';
import { GameType } from './types/GameType.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for health checks and any HTTP endpoints
// Use a function to handle dynamic origin validation
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'https://uwguesser.com',
      'https://www.uwguesser.com'
    ];

    // Check if origin matches allowed list or is a Vercel deployment
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('[CORS] Rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'https://uwguesser.com',
        'https://www.uwguesser.com'
      ];

      // Check if origin matches allowed list or is a Vercel deployment
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        console.log('[Socket.IO CORS] Rejected origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  socket.on('playerReady', (data) => {
    console.log(`User ${socket.id} ready in session:`, data.sessionId);
    handlePlayerReady(socket, data.sessionId, socket.id, gameRooms);
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
