const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Set CORS headers as per Vercel support suggestion
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        // Handle preflight request
        return res.status(204).end();
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
