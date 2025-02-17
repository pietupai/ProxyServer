const express = require('express');
const { DateTime } = require('luxon');
const app = express();
const port = process.env.PORT || 3000;

const isVercel = !!process.env.VERCEL;

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

let lastSentTime = process.env.LAST_SENT_TIME && !isNaN(parseInt(process.env.LAST_SENT_TIME))
    ? parseInt(process.env.LAST_SENT_TIME)
    : Date.now();
console.log(`Initial lastSentTime: ${new Date(lastSentTime).toLocaleString()}`);

let checkInterval;

const updateLastSentTime = (timestamp) => {
    if (isVercel) {
        process.env.LAST_SENT_TIME = timestamp.toString();
    } else {
        lastSentTime = timestamp;
    }
};

const sendServerTime = (res, updateTimestamp = true) => {
    const currentTime = Date.now();
    const elapsed = ((currentTime - lastSentTime) / 1000).toFixed(2);
    const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
    const message = `Server time: ${now} - elapsed: ${elapsed}s`;
    res.write(`data: ${message}\n\n`);
    if (updateTimestamp) {
        updateLastSentTime(currentTime); // Päivitetään lähetysaika vain tarvittaessa
    }
    console.log('SSE message sent:', message);
};

app.listen(port, () => {
    console.log(`SSE server running on http://localhost:${port}`);
    console.log(isVercel ? "Running on Vercel" : "Running locally");
});

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log(`SSE connection established: ${DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS)}`);

    if (checkInterval) {
        clearInterval(checkInterval);
    }

    // Tarkistetaan, onko viimeisestä viestistä kulunut yli 30 sekuntia ja lähetetään viesti tarvittaessa
    const currentTime = Date.now();
    const elapsedReconnect = (currentTime - lastSentTime) / 1000;
    if (!isNaN(elapsedReconnect) && elapsedReconnect >= 30) {
        sendServerTime(res);
    } else {
        const timeoutId = setTimeout(() => {
            sendServerTime(res);
            checkInterval = setInterval(() => {
                const currentTime = Date.now();
                const elapsed = (currentTime - lastSentTime) / 1000;
                if (!isNaN(elapsed) && elapsed >= 30) {
                    sendServerTime(res);
                }
            }, 1000); // Tarkistetaan joka sekunti, onko 30 sekuntia kulunut
        }, (!isNaN(30 - elapsedReconnect) ? (30 - elapsedReconnect) * 1000 : 0));

