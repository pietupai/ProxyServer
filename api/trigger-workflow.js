<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request to Vercel API</title>
</head>
<body>
    <h1>Request to Vercel API</h1>
    <input type="text" id="urlInput" placeholder="Enter URL">
    <button id="sendRequestButton">Send Request</button>
    <p id="responseMessage"></p>

    <script>
        document.getElementById('sendRequestButton').onclick = async function () {
            const urlInput = document.getElementById('urlInput').value;
            const responseMessage = document.getElementById('responseMessage');

            if (!urlInput) {
                responseMessage.textContent = 'Please enter a URL';
                return;
            }

            try {
                const response = await fetch('https://proxyserver2-sandy.vercel.app/api/trigger-workflow', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: urlInput })
                });

                if (response.ok) {
                    const result = await response.json();
                    responseMessage.textContent = `Success: ${JSON.stringify(result)}`;
                } else {
                    const errorText = await response.text();
                    responseMessage.textContent = `Error: ${errorText}`;
                }
            } catch (error) {
                responseMessage.textContent = `Request failed: ${error.message}`;
            }
        };
    </script>
</body>
</html>
