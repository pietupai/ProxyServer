export default (req, res) => {
  if (req.method === 'POST') {
    const { body } = req;
    console.log('Webhook event received:', body);

    // Välitä webhook-tieto clientille tai tallenna se käsittelyä varten
    // Voit käyttää WebSocketia lähettääksesi tämän tiedon clientille reaaliajassa

    res.status(200).json({ message: 'Webhook received successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
