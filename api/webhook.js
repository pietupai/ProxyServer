const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const events = require('events');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const eventEmitter = new events.EventEmitter();

function getCurrentTimestamp() {
  return new Date().toISOString();
}

app.post('/api/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log(`[${getCurrentTimestamp()}] Webhook event received:`, body);

    // Fetch the updated response.txt content
    const response = await fetch('https://raw.githubusercontent.com/pietupai/hae/main/response.txt');
    const data = await response.text();

    // Emit event with the updated content
    eventEmitter.emit('newWebhook', data);

    res.status(200).send(data);
  } catch (error) {
    console.error(`[${getCurrentTimestamp()}] Error handling webhook:`, error);
    res.status(500).send('Error handling webhook');
  }
});

// SSE endpoint with additional logging
app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log(`[${getCurrentTimestamp()}] SSE connection established`);

  const listener = (data) => {
    console.log(`[${getCurrentTimestamp()}] Sending data to SSE client:`, data);
    res.write(`data: ${data}\n\n`);
  };

  eventEmitter.on('newWebhook', listener);

  req.on('close', () => {
    eventEmitter.removeListener('newWebhook', listener);
    console.log(`[${getCurrentTimestamp()}] SSE connection closed`);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[${getCurrentTimestamp()}] Server is running on port ${PORT}`);
});

module.exports = app;
