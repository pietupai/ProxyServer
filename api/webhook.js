export default (req, res) => {
  if (req.method === 'POST') {
    const body = req.body;
    console.log('Webhook event received:', body);

    // Käsittele webhook-viesti täällä
    // Voit esimerkiksi lähettää tämän tiedon WebSocketin kautta clientille

    res.status(200).json({ message: 'Webhook received successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
