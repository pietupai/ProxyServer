const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        // Handle preflight request
        res.status(204).end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const parsedBody = JSON.parse(body);
                const { url } = parsedBody;

                const apiKey = process.env.GITHUB_API_KEY;
                const data = JSON.stringify({
                    ref: 'main',
                    inputs: { url: url }
                });
                const githubUrl = 'https://api.github.com/repos/pietupai/hae/actions/workflows/update-request.yml/dispatches';

                // Dispatch the workflow
                const response = await fetch(githubUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `token ${apiKey}`
                    },
                    body: data
                });
                if (response.ok) {
                    res.status(200).json({ message: 'Request sent successfully!' });
                } else {
                    const text = await response.text();
                    res.status(response.status).json({ error: `Error sending the request: ${text}` });
                }
            } catch (error) {
                res.status(500).json({ error: `Error sending the request: ${error.message}` });
            }
        });
    } else if (req.method === 'GET') {
        res.status(200).send('Use POST');
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
