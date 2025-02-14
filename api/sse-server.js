const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Salli kaikki alueet

    // Lähetetään data heti ensimmäisen kerran
    res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);

    // Lähetetään data 5 sekunnin välein
    setInterval(() => {
        res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);
    }, 5000);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tarjoa favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
});

app.listen(port, () => {
    console.log(`SSE-palvelin käynnissä osoitteessa http://localhost:${port}`);
});
