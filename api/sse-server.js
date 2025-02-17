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
let lastMessageTimestamp = null;
let messageInterval;

const sendServerTime = (res) => {
    const currentTime = Date.now();
    const elapsed = ((currentTime - lastSentTime) / 1000).toFixed(2);
    const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
    const message = `Server time: ${now} - elapsed: ${elapsed}s`;
    res.write(`data: ${message}\n\n`);
    lastSentTime = currentTime;
    lastMessageTimestamp = now; // Tallennetaan viimeisin lähetysaika
    console.log('SSE message sent:', message);
};

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log(`SSE connection established: ${DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS)}`);

    clearInterval(messageInterval);

    if (lastMessageTimestamp) {
        const message = `Server time: ${lastMessageTimestamp} - Reconnected`;
        res.write(`data: ${message}\n\n`);
        console.log('Reconnected message sent:', message);
    }

    lastSentTime = Date.now(); // Päivitetään lastSentTime heti yhteyden avaamisen jälkeen

    messageInterval = setInterval(() => {
        sendServerTime(res);
    }, 2000); // Lähetä data-viesti 2 sekunnin välein

    req.on('close', () => {
        console.log('SSE connection closed');
        clearInterval(messageInterval);
    });
});

app.listen(port, () => {
    console.log(`SSE server running on http://localhost:${port}`);
});
