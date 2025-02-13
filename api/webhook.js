const express = require('express');
const bodyParser = require('body-parser');
const events = require('events');

const app = express();
app.use(bodyParser.json());

const eventEmitter = new events.EventEmitter();

app.post('/api/webhook', (req, res) => {
  try {
    const body = req.body;
    console.log('Webhook event received:', body);

    // Emit event for SSE clients
    eventEmitter.emit('newWebhook', JSON.stringify(body));

    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Error handling webhook' });
  }
});

// SSE endpoint
app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Listen for new webhook events
  const listener = (data) => {
    res.write(`data: ${data}\n\n`);
  };

  eventEmitter.on('newWebhook', listener);

  // Remove listener when connection is closed
  req.on('close', () => {
    eventEmitter.removeListener('newWebhook', listener);
  });
});

module.exports = app;
