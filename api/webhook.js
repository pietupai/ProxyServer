const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let sseClients = [];

const addSseClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  console.log('SSE client connected');

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
    console.log('SSE client disconnected');
  });
};

const sendSseMessage = (data) => {
  sseClients.forEach(client => {
    client.write(`data: ${data}\n\n`);
    console.log('SSE message sent to client');
  });
};

app.post('/api/webhook', async (req, res) => {
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

    sendSseMessage(data);

    res.status(200).send(data);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error handling webhook');
  }
});

app.get('/api/sse', (req, res) => {
  addSseClient(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
