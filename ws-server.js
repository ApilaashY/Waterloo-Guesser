// ws-server.js -- for testing and understanding WebSocket interactions
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3002 });

// sessionId -> ws
const clients = new Map();
// sessionId -> partnerId
const partners = new Map();

server.on('connection', (ws) => {
  let sessionId = null;

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'join') {
        sessionId = data.sessionId;
        clients.set(sessionId, ws);
        if (data.partnerId) {
          partners.set(sessionId, data.partnerId);
        }
        ws.send(JSON.stringify({ type: 'joined', sessionId, partnerId: data.partnerId }));
      } else if (data.type === 'action' && data.partnerId) {
        // Relay action to partner
        const partnerWs = clients.get(data.partnerId);
        if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
          partnerWs.send(JSON.stringify({ type: 'action', from: sessionId, payload: data.payload }));
        }
      } else if (data.type === 'points' && data.partnerId) {
        // Relay points to partner
        const partnerWs = clients.get(data.partnerId);
        if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
          partnerWs.send(JSON.stringify({
            type: 'points',
            points: data.points,
            sessionId,
            partnerId: data.partnerId
          }));
        }
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', error: e.message }));
    }
  });

  ws.on('close', () => {
    if (sessionId) {
      clients.delete(sessionId);
      partners.delete(sessionId);
    }
  });
});

console.log('WebSocket server running on ws://localhost:3002');
