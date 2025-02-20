const fetch = require('node-fetch');
const { addSseClient, sendSseMessage } = require('./sse');

module.exports = (app) => {
  const clients = [];

  app.get('/api/sse', (req, res) => {
    console.log('SSE connection request received');
    addSseClient(req, res, clients);
    console.log('Total SSE clients:', clients.length);
  });

  app.post('/api/webhook', async (req, res) => {
    try {
      const body = req.body;
      console.log('Webhook event received:', body);

      // Simuloidaan tiedonsiirtoa
      const data = "Simulated data for SSE clients";
      console.log('Prepared data:', data);

      // Lähetä SSE-viesti
      sendSseMessage(clients, data);

      // Lähetä vastausdata
      res.status(200).json({ data });
    } catch (error) {
      console.error('Error handling webhook:', error.message);
      res.status(500).json({ error: `Error handling webhook: ${error.message}` });
    }
  });

  app.all('/api/*', (req, res) => {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  });
};
