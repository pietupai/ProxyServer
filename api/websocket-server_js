const express = require('express');
const http = require('http');
const WebSocket = require('ws');
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

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    const sendTime = () => {
        const now = DateTime.now().setZone('Europe/Helsinki').toLocaleString(DateTime.TIME_WITH_SECONDS);
        ws.send(`Server time: ${now}`);
    };

    sendTime();
    const intervalId = setInterval(sendTime, 5000);

    ws.on('close', () => {
        clearInterval(intervalId);
    });
});

// Serve HTML file for testing
app.get('/sse-index', (req, res) => {
    res.sendFile(path.join(__dirname, '../sse-index.html'));
});

// Serve favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../favicon.ico'));
});

// Start the server
server.listen(port, () => {
    console.log(`WebSocket server running on http://localhost:${port}`);
});
