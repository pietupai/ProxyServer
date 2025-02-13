const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/api/webhook', (req, res) => {
  try {
    const body = req.body;
    console.log('Webhook event received:', body);

    // Käsittele webhook-viesti täällä
    // Voit esimerkiksi lähettää tämän tiedon WebSocketin kautta clientille

    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Error handling webhook' });
  }
});

module.exports = app;
