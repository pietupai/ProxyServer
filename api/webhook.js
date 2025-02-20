const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const events = require('events');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  req.app.locals.eventEmitter = req.app.locals.eventEmitter || new events.EventEmitter();
  next();
});

app.post('/api/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('Webhook event received:', body);

    // Fetch the updated response.txt content
    const response = await fetch('https://raw.githubusercontent.com/pietupai/hae/main/response.txt', {
      redirect: 'follow'
    });
    const data = await response.text();

    // Emit event with the updated content
    console.log(`Emitting newWebhook event with data: ${data}`);
    req.app.locals.eventEmitter.emit('newWebhook', data);
    console.log('Event emitted successfully');

    res.status(200).send(data);
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

  const listener = (data) => {
    console.log(`Listener received data: ${data}`);
    res.write(`data: ${data}\n\n`);
    console.log('Data sent to SSE client');
  };

  req.app.locals.eventEmitter.on('newWebhook', listener);

  if (req.app.locals.eventEmitter.listenerCount('newWebhook') > 0) {
    console.log(`Listener registered for newWebhook event, count: ${req.app.locals.eventEmitter.listenerCount('newWebhook')}`);
  } else {
    console.log('Failed to register listener for newWebhook event');
  }

  req.on('close', () => {
    req.app.locals.eventEmitter.removeListener('newWebhook', listener);
    console.log('SSE connection closed and listener removed');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
