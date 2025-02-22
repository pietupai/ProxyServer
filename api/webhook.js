const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const eventEmitter = require('./eventEmitter');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/api/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('Webhook event received:', body);

    // Fetch the updated response.txt content
    const response = await fetch('https://api.github.com/repos/pietupai/hae/contents/response.txt');
    const data = await response.json();
    const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');

    // Emit event with the updated content
    console.log('Emitting event: newWebhook');
    eventEmitter.emit('newWebhook', decodedContent);

    res.status(200).send(decodedContent);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error handling webhook');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
