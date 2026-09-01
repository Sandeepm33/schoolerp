// Server-Sent Events (SSE) Real-Time Synchronization Engine
const clients = new Set();
let lastServerMutationTimestamp = Date.now();

function handleSyncStream(req, res) {
  // SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no' // Disable proxy buffering
  });

  // Send initial connection event
  const initMsg = JSON.stringify({
    type: 'CONNECTED',
    timestamp: Date.now(),
    lastServerMutationTimestamp
  });
  res.write(`data: ${initMsg}\n\n`);

  clients.add(res);

  // Send periodic keep-alive ping every 15s to prevent socket timeouts
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(`: keep-alive ${Date.now()}\n\n`);
    } catch (err) {
      clearInterval(keepAliveInterval);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    clients.delete(res);
  });
}

function broadcastDataMutation(eventData = {}) {
  lastServerMutationTimestamp = Date.now();

  const payload = JSON.stringify({
    type: 'DATA_CHANGE',
    entity: eventData.entity || 'ALL',
    action: eventData.action || 'UPDATE',
    payload: eventData.payload || {},
    timestamp: lastServerMutationTimestamp
  });

  const message = `data: ${payload}\n\n`;

  for (const clientRes of clients) {
    try {
      clientRes.write(message);
    } catch (err) {
      clients.delete(clientRes);
    }
  }
}

function handleSyncCheck(req, res) {
  res.json({
    status: 'ONLINE',
    lastServerMutationTimestamp,
    activeConnections: clients.size
  });
}

module.exports = {
  handleSyncStream,
  broadcastDataMutation,
  handleSyncCheck
};
