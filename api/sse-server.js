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

let previousTime = Date.now();

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log(`SSE connection established: ${DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS)}`);
    
    const sendServerTime = () => {
        const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
        const currentTime = Date.now();
        const elapsed = ((currentTime - previousTime) / 1000).toFixed(2);
        res.write(`data: Server time: ${now} - elapsed: ${elapsed}s\n\n`);
        previousTime = currentTime;
        console.log('SSE message sent');
        
        // Ajastetaan seuraava viestin lähetys
        setTimeout(sendServerTime, 10000);
    };

    const sendKeepAlive = () => {
        res.write('data: keep-alive\n\n');
        console.log('Keep-alive message sent');
        
        // Ajastetaan seuraava keep-alive -viestin lähetys
        setTimeout(sendKeepAlive, 5000);
    };

    // Aloitetaan viestien ja keep-alive -viestien lähetys
    sendServerTime();
    sendKeepAlive();

    req.on('close', () => {
        console.log('SSE connection closed');
    });
});

app.listen(port, () => {
    console.log(`SSE server running on http://localhost:${port}`);
});
