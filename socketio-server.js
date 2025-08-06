// socketio-server.js -- for testing and understanding Socket.IO interactions
const { Server } = require('socket.io');
const io = new Server(3002, {
  cors: {
    origin: '*', // Allow all origins for dev; restrict in prod
    methods: ['GET', 'POST']
  }
});

// sessionId -> socket
const clients = new Map();
// sessionId -> partnerId
const partners = new Map();

io.on('connection', (socket) => {
  let sessionId = null;

  socket.on('join', ({ sessionId: sid, partnerId }) => {
    sessionId = sid;
    clients.set(sessionId, socket);
    if (partnerId) {
      partners.set(sessionId, partnerId);
    }
    socket.emit('joined', { sessionId, partnerId });
  });

  socket.on('action', ({ partnerId, payload }) => {
    const partnerSocket = clients.get(partnerId);
    if (partnerSocket) {
      partnerSocket.emit('action', { from: sessionId, payload });
    }
  });

  socket.on('points', ({ points, partnerId }) => {
    const partnerSocket = clients.get(partnerId);
    if (partnerSocket) {
      partnerSocket.emit('points', {
        points,
        sessionId,
        partnerId
      });
    }
  });

  socket.on('disconnect', () => {
    if (sessionId) {
      clients.delete(sessionId);
      partners.delete(sessionId);
    }
  });
});

console.log('Socket.IO server running on ws://localhost:3002');
