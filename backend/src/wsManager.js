const WebSocket = require('ws');

let wss = null;

/**
 * Attaches a WebSocket server to an existing HTTP server instance.
 * Must be called once during bootstrap, before the server starts listening.
 */
function initWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[WS] Client connected from ${clientIp}. Total clients: ${wss.clients.size}`);

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to APT real-time order stream',
      timestamp: new Date().toISOString(),
    }));

    ws.on('close', () => {
      console.log(`[WS] Client disconnected. Total clients: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Client error from ${clientIp}:`, err.message);
    });
  });

  console.log('[WS] WebSocket server initialized and attached to HTTP server');
}

/**
 * Broadcasts a JSON-serializable payload to every connected WebSocket client.
 * Skips clients that are not in OPEN state.
 */
function broadcast(data) {
  if (!wss) {
    console.warn('[WS] Broadcast called before WebSocket server was initialized');
    return;
  }

  const message = JSON.stringify(data);
  let sentCount = 0;
  let skippedCount = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    } else {
      skippedCount++;
    }
  });

  console.log(`[WS] Broadcast → sent to ${sentCount} client(s), skipped ${skippedCount}`);
}

function getConnectedClientCount() {
  return wss ? wss.clients.size : 0;
}

module.exports = { initWebSocketServer, broadcast, getConnectedClientCount };
