let sseClients = [];

const addSseClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Ensure no buffering
  res.flushHeaders();

  sseClients.push(res);
  console.log('SSE client connected. Total clients:', sseClients.length);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
    console.log('SSE client disconnected. Total clients:', sseClients.length);
  });
};

const sendSseMessage = (data) => {
  console.log('Sending SSE message to', sseClients.length, 'clients');
  sseClients.forEach(client => {
    client.write(`data: ${data}\n\n`);
    console.log('SSE message sent to client');
  });
};

module.exports = (req, res) => {
  if (req.method === 'GET') {
    console.log('SSE connection request received');
    addSseClient(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Export the sendSseMessage function so it can be used in webhook.js
module.exports.sendSseMessage = sendSseMessage;
