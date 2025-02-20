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
    sseClients = sseClients.filter(client => client.id !== clientId);
    console.log(`SSE client disconnected. Client ID: ${clientId}`);
  });

  console.log('SSE client connected. Client ID:', clientId);
  return newClient;
};

const sendSseMessage = (data) => {
  console.log('Sending SSE message to', sseClients.length, 'clients');
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
    client.res.flush(); // Pakotetaan lähettämään tiedot
    console.log('SSE message sent to client', client.id);
  });
};

// Oletusvientifunktio vaaditaan
module.exports = (req, res) => {
  if (req.method === 'GET') {
    console.log('SSE connection request received');
    const newClient = addSseClient(req, res);
    sseClients.push(newClient);
    console.log('Total SSE clients:', sseClients.length);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Export the sendSseMessage function and sseClients array so it can be used in webhook.js
module.exports.sendSseMessage = sendSseMessage;
module.exports.sseClients = sseClients;
