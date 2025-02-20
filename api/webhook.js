const fetch = require('node-fetch');
const { sendSseMessage } = require('./sse');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('Webhook event received:', body);

      // Oikea URL-osoite ilman ohjausta
      const responseUrl = `https://raw.githubusercontent.com/pietupai/hae/main/response.txt?timestamp=${new Date().getTime()}`;
      console.log(`Fetching from URL: ${responseUrl}`);
      const response = await fetch(responseUrl, { redirect: 'follow' });

      // Tarkista, että verkkovastaus on kunnossa
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.text();
      console.log('Fetched data:', data);

      // Varmista, että haettu data on kelvollinen
      if (data.includes('<HEAD>')) {
        throw new Error('Received HTML content instead of expected text');
      }

      // Lähetä SSE-viesti
      sendSseMessage(data);

      // Lähetä vastausdata
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
