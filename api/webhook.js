const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const events = require('events');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.text());
app.use(cors());

const eventEmitter = new events.EventEmitter();

app.post('/api/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('Webhook event received:', body);
    console.log('req body:', body);

    // Fetch the updated response.txt content
    //const response = await fetch('https://api.github.com/repos/pietupai/hae/contents/response.txt');
    const response = await fetch('https://raw.githubusercontent.com/pietupai/hae/main/response.txt');
    //const data = await response.json();
    const data = await response.text();
    const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');

    // Emit event with the updated content
    eventEmitter.emit('newWebhook', decodedContent);

    res.status(200).send(decodedContent);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error handling webhook');
  }
});

// SSE endpoint with additional logging
app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log('SSE connection established');

  const keepAlive = setInterval(() => {
    res.write('data: keep-alive\n\n');
    console.log('Keep-alive message sent');
  }, 5000);

  const listener = (data) => {
    console.log('Sending data to SSE client:', data);
    res.write(`data: ${data}\n\n`);
  };

  eventEmitter.on('newWebhook', listener);

  req.on('close', () => {
    clearInterval(keepAlive);
    //eventEmitter.removeListener('newWebhook', listener);
    console.log('SSE connection closed');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
