const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        // Handle the preflight request
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins or specify specific origins
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
        res.status(200).end(); // Respond with 200 OK and terminate the response
        return;
    }

    // Set CORS headers for other methods
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

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
