const fetch = require('node-fetch');
const { sendSseMessage } = require('./sse');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('Webhook event received:', body);

      // Fetch the updated content from response.txt with a timestamp to avoid caching
      const timestamp = new Date().getTime();
      const responseUrl = `https://raw.githubusercontent.com/pietupai/hae/main/response.txt?timestamp=${timestamp}`;
      console.log(`Fetching from URL: ${responseUrl}`);
      const response = await fetch(responseUrl, { headers: { 'Cache-Control': 'no-cache' } });

      const data = await response.text();
      console.log('Fetched data:', data);

      // Send SSE message
      sendSseMessage(data);

      // Send response data
      res.status(200).json({ data });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Error handling webhook' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
