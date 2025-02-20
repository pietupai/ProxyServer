const fetch = require('node-fetch');
const { handleSseRequest, sendSseMessage } = require('./sse');

module.exports = (app) => {
  app.get('/api/sse', handleSseRequest);

  app.post('/api/webhook', async (req, res) => {
    try {
      const body = req.body;
      console.log('Webhook event received:', body);

      // Simulated data for SSE clients
      const data = "Simulated data for SSE clients";
      console.log('Prepared data:', data);

      // Send SSE message
      sendSseMessage(req.app.locals.sseClients, data);

      // Send response data
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
