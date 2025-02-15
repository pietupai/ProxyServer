const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    const sendTime = () => {
        const now = new Date().toISOString();
        ws.send(`Server time: ${now}`);
    };

    // Lähetetään aika asiakkaalle 5 sekunnin välein
    sendTime();
    const intervalId = setInterval(sendTime, 5000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});
