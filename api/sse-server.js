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
    res.flushHeaders();
    
    console.log('SSE connection established');
    let previousTime = Date.now();

    const sendServerTime = () => {
        const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
        const currentTime = Date.now();
        const elapsed = ((currentTime - previousTime) / 1000).toFixed(2);
        res.write(`data: Server time: ${now} - elapsed: ${elapsed}s\n\n`);
        previousTime = currentTime;
        console.log('SSE message sended');
    };

    //sendServerTime();
    //const intervalId = setInterval(sendServerTime, 10000); // 10 sekunnin välein

    //const keepAlive = setInterval(() => {  res.write('data: keep-alive\n\n');  console.log('Keep-alive message sent');  }, 5000);
    setTimeout(() => { console.log('Keep-alive message sent'); res.write('data: \n\n'); }, 5000);

    req.on('close', () => {
        console.log('SSE connection closed ');
        clearInterval(intervalId);
    });
});

app.listen(port, () => {
    console.log(`SSE server running on http://localhost:${port}`);
});
