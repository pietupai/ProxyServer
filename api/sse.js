const addSseClient = (req, res, clients) => {
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
    clients = clients.filter(client => client.id !== clientId);
    console.log(`SSE client disconnected. Client ID: ${clientId}`);
  });

  clients.push(newClient);
  console.log('SSE client connected. Client ID:', clientId);
  return clients;
};

const sendSseMessage = (clients, data) => {
  console.log('Sending SSE message to', clients.length, 'clients');
  clients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
    client.res.flush(); // Pakotetaan lähettämään tiedot
    console.log('SSE message sent to client', client.id);
  });
};

module.exports = { addSseClient, sendSseMessage };
