import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createApiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.join(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const wsClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`[WS] Client connected. Total active connections: ${wsClients.size}`);

  ws.send(
    JSON.stringify({
      type: 'CONNECTED',
      payload: { message: 'Connected to VeriFlow Real-time Verification Stream' }
    })
  );

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`[WS] Client disconnected. Total active connections: ${wsClients.size}`);
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      console.log('[WS] Received message:', parsed.type);
    } catch (err) {
      // ignore
    }
  });
});

// API Routes
app.use('/api', createApiRouter(wsClients));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VeriFlow Verification Engine', timestamp: new Date().toISOString() });
});

// Serve frontend SPA bundle from client/dist if built
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
  console.log(`📦 Serving production frontend bundle from ${CLIENT_DIST}`);
}

server.listen(PORT, () => {
  console.log(`🚀 VeriFlow Single Unified App running at: http://localhost:${PORT}`);
  console.log(`📡 WebSocket stream active on ws://localhost:${PORT}/ws`);
});
