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

    // Fetch the updated response.txt content
    const response = await fetch('https://api.github.com/repos/pietupai/hae/contents/response.txt');
    const data = await response.json();
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

    // Funktio lähettämään aikaa Suomen aikavyöhykkeellä ja kulunut aika
    let previousTime = Date.now();

    const sendServerTime = () => {
        const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
        const currentTime = Date.now();
        const elapsed = ((currentTime - previousTime) / 1000).toFixed(2);
        res.write(`data: Server time: ${now} - elapsed: ${elapsed}s\n\n`);
        previousTime = currentTime;
    };

    // Lähetetään data heti ensimmäisen kerran
    sendServerTime();
    const intervalId = setInterval(() => {
        sendServerTime();
    }, 5000);

    // Lähetetään keep-alive viesti 15 sekunnin välein
    const keepAliveId = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 15000);

    req.on('close', () => {
        clearInterval(intervalId);
        clearInterval(keepAliveId);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
