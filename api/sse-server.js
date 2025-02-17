const express = require('express');
const { DateTime } = require('luxon');
const app = express();
const port = process.env.PORT || 3000;

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

let lastSentTime = Date.now();
let messageInterval;
let keepAliveInterval;

const sendServerTime = (res) => {
    const currentTime = Date.now();
    const elapsed = ((currentTime - lastSentTime) / 1000).toFixed(2);
    const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
    const message = `Server time: ${now} - elapsed: ${elapsed}s`;
    res.write(`data: ${message}\n\n`);
    lastSentTime = currentTime;
    console.log('SSE message sent:', message);
};

const sendKeepAlive = (res) => {
    const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
    res.write(`data: keep-alive: PING at ${now}\n\n`);
    console.log('Keep-alive message sent: PING', now);
};

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log(`SSE connection established: ${DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS)}`);

    clearInterval(messageInterval);
    clearInterval(keepAliveInterval);

    lastSentTime = Date.now(); // Päivitetään lastSentTime heti yhteyden avaamisen jälkeen

    sendServerTime(res); // Lähetä ensimmäinen data-viesti heti
    messageInterval = setInterval(() => sendServerTime(res), 10000); // Lähetä data-viesti 10 sekunnin välein
    sendKeepAlive(res); // Lähetä ensimmäinen keep-alive-viesti heti
    keepAliveInterval = setInterval(() => sendKeepAlive(res), 5000); // Lähetä keep-alive-viesti 5 sekunnin välein

    req.on('close', () => {
        console.log('SSE connection closed');
        clearInterval(messageInterval);
        clearInterval(keepAliveInterval);
    });
});

app.listen(port, () => {
    console.log(`SSE server running on http://localhost:${port}`);
});
