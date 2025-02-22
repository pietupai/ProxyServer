const fetch = require('node-fetch');
const { addSseClient, sendSseMessage } = require('./sse');

module.exports = async (req, res) => {
  if (!req.app.locals.sseClients) {
    req.app.locals.sseClients = [];
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('Webhook event received:', body);

      // Simuloidaan tiedonsiirtoa
      const data = "Simulated data for SSE clients";
      console.log('Prepared data:', data);

      // Lähetä SSE-viesti
      sendSseMessage(req.app.locals.sseClients, data);

      // Lähetä vastausdata
      res.status(200).json({ data });
    } catch (error) {
      console.error('Error handling webhook:', error.message);
      res.status(500).json({ error: `Error handling webhook: ${error.message}` });
    }
  } else if (req.method === 'GET') {
    console.log('SSE connection request received');
    addSseClient(req, res, req.app.locals.sseClients);
    console.log('Total SSE clients:', req.app.locals.sseClients.length);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
