const fetch = require('node-fetch');
const { addSseClient, sendSseMessage } = require('./sse');

let sseClients = [];

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('Webhook event received:', body);

      // Fetch the updated content from response.txt with a timestamp to avoid caching
      const responseUrl = `https://raw.githubusercontent.com/pietupai/hae/main/response.txt?timestamp=${new Date().getTime()}`;
      console.log(`Fetching from URL: ${responseUrl}`);
      const response = await fetch(responseUrl, { headers: { 'Cache-Control': 'no-cache' } });

      const data = await response.text();
      console.log('Fetched data:', data);

      // Varmistetaan, että data on kelvollista eikä HTML-sisältöä
      if (data.includes('<HEAD>')) {
        throw new Error('Received HTML content instead of expected text');
      }

      // Send SSE message
      setTimeout(() => {
        sendSseMessage(sseClients, data);
      }, 1000);  // Viivästetään viestin lähetystä varmistaakseen, että asiakkaat ovat yhteydessä

      // Lähetä vastausdata
      res.status(200).json({ data });
    } catch (error) {
      console.error('Error handling webhook:', error.message);
      res.status(500).json({ error: `Error handling webhook: ${error.message}` });
    }
  } else if (req.method === 'GET') {
    console.log('SSE connection request received');
    const newClient = addSseClient(req, res);
    sseClients.push(newClient);
    console.log('Total SSE clients:', sseClients.length);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
