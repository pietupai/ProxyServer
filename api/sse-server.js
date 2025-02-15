const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000;

// Ota käyttöön kompressio ja flush
app.use(compression());

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

    // Lähetetään data heti ensimmäisen kerran
    res.write(`data: ${new Date().toLocaleTimeString()}\n\n`);

    // Lähetetään data 5 sekunnin välein tarkasti
    let startTime = Date.now();
    const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = ((currentTime - startTime) / 1000).toFixed(2);
        res.write(`data: ${new Date().toLocaleTimeString()} - elapsed: ${elapsed}s\n\n`);
        res.flush();
        startTime = currentTime;
    }, 5000);

    // Lähetetään keep-alive viesti 15 sekunnin välein
    const keepAliveId = setInterval(() => {
        res.write(':\n\n');
        res.flush();
    }, 15000);

    req.on('close', () => {
        clearInterval(intervalId);
        clearInterval(keepAliveId);
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
