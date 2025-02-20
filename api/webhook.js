const fetch = require('node-fetch');
const { sendSseMessage } = require('./sse');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('Webhook event received:', body);

      // Fetch the updated content from response.txt without any redirection issues
      const responseUrl = `https://raw.githubusercontent.com/pietupai/hae/main/response.txt?timestamp=${new Date().getTime()}`;
      console.log(`Fetching from URL: ${responseUrl}`);
      const response = await fetch(responseUrl, { headers: { 'Cache-Control': 'no-cache' } });

      const data = await response.text();
      console.log('Fetched data:', data);

      // Ensure fetched data is valid before sending SSE message
      if (data.includes('<HEAD>')) {
        throw new Error('Received HTML content instead of expected text');
      }

      // Send SSE message
      sendSseMessage(data);

      // Send response data
      res.status(200).json({ data });
    } catch (error) {
      console.error('Error handling webhook:', error.message);
      res.status(500).json({ error: `Error handling webhook: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
