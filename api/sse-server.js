<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSE Demo with timer and counter</title>
</head>
<body>
    <h1>SSE Demo with timer and counter</h1>
    <div id="time"></div>
    <div id="ping"></div>
    <div id="messageCount"></div>
    <script>
        let messageCount = 0;
        let errorCount = 0;
        let reconnectAttempts = 0;
        let connectionTimeout;
        let lastReceivedTime = Date.now();
        const vercelUrl = 'https://proxyserver2-sandy.vercel.app/api/events';

        console.log("Script started : " + new Date().toISOString().replace("T"," ").substring(0, 19));

        function startEventSource() {
            const eventSource = new EventSource(vercelUrl);
            console.log("SSE connection established : " + new Date().toISOString().replace("T"," ").substring(0, 19));

            function closeConnection() {
                console.log("Closing SSE connection to avoid onerror");
                eventSource.close();
                reconnectAttempts++;
                const reconnectDelay = 500; // Lyhennetty viive, 0.5 sekuntia
                console.log(`Reconnecting in ${reconnectDelay / 1000} seconds...`);
                setTimeout(startEventSource, reconnectDelay);
            }

            eventSource.onmessage = function(event) {
                const currentTime = Date.now();
                const elapsed = ((currentTime - lastReceivedTime) / 1000).toFixed(2);
                const timestamp = new Date().toISOString().replace("T"," ").substring(0, 19);
                console.log("onmessage : " + timestamp + " - Data: " + event.data);

                if (elapsed >= 2) { // Tarkistetaan, että edellisestä lähetyksestä on kulunut vähintään 2 sekuntia
                    lastReceivedTime = currentTime;

                    if (event.data.startsWith('keep-alive:')) {
                        document.getElementById('ping').innerText = 'Received: ' + event.data;
                    } else {
                        messageCount++;
                        document.getElementById('time').innerText = 'Server time: ' + event.data;
                        document.getElementById('messageCount').innerText = 'Messages received: ' + messageCount;
                    }
                }
            };

            eventSource.onopen = function(event) {
                const timestamp = new Date().toISOString().replace("T"," ").substring(0, 19);
                console.log("SSE connection open at : " + timestamp);
                reconnectAttempts = 0; // Nollataan uudelleen yhdistämisyritykset onnistuneen yhdistämisen jälkeen
                clearTimeout(connectionTimeout);
                connectionTimeout = setTimeout(closeConnection, 9500); // Katkaistaan yhteys 9.5 sekunnin jälkeen
            };

            eventSource.onerror = function(event) {
                const timestamp = new Date().toISOString().replace("T"," ").substring(0, 19);
                errorCount++;
                console.log("SSE error : " + timestamp);
                console.log('SSE error: count =', errorCount);
                console.error('SSE error:', event);
                clearTimeout(connectionTimeout); // Poistetaan virheellinen logitus yhteyden katkeamisen jälkeen
            };

            eventSource.onclose = function(event) {
                const timestamp = new Date().toISOString().replace("T"," ").substring(0, 19);
                console.log("SSE connection closed at : " + timestamp);
            };
        }

        startEventSource();
    </script>
</body>
</html>
