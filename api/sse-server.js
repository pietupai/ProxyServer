const express = require('express');
const path = require('path');
const { DateTime } = require('luxon');
const app = express();
const port = process.env.PORT || 3000;

// Set CORS headers as per Vercel support suggestion
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    next();
});

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Funktio lähettämään aikaa Suomen aikavyöhykkeellä
    const sendServerTime = () => {
        const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
        res.write(`data: ${now}\n\n`);
    };

    // Lähetetään data heti ensimmäisen kerran
    sendServerTime();
    const intervalId = setInterval(sendServerTime, 5000);

    req.on('close', () => {
        clearInterval(intervalId);
    });
});

app.get('/sse-index', (req, res) => {
    res.sendFile(path.join(__dirname, '../sse-index.html'));
});

// Tarjoa favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../favicon.ico'));
});

app.listen(port, () => {
    console.log(`SSE-palvelin käynnissä osoitteessa http://localhost:${port}`);
});
