let sseClients = [];

const addSseClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Ensure no buffering
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  res.on('close', () => {
    const index = sseClients.findIndex(client => client.id === clientId);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
    console.log(`SSE client disconnected. Client ID: ${clientId}`);
  });

  sseClients.push(newClient);
  console.log('SSE client connected. Client ID:', clientId);
};

const sendSseMessage = (data) => {
  console.log('Sending SSE message to', sseClients.length, 'clients');
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
    client.res.flush(); // Pakotetaan lähettämään tiedot
    console.log('SSE message sent to client', client.id);
  });
};

// Oletusvientifunktio
module.exports = (req, res) => {
  if (req.method === 'GET') {
    console.log('SSE connection request received');
    addSseClient(req, res);
    console.log('Total SSE clients:', sseClients.length);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Export the functions so they can be used in webhook.js
module.exports.addSseClient = addSseClient;
module.exports.sendSseMessage = sendSseMessage;
