const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Ensure request body is parsed correctly
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const parsedBody = JSON.parse(body);
                const { url } = parsedBody;

                // Your existing code with updated GitHub username
                const apiKey = process.env.GITHUB_API_KEY; // Ensure you set this in your Vercel environment variables
                const data = JSON.stringify({
                    ref: 'main',
                    inputs: { url: url }
                });
                const githubUrl = 'https://api.github.com/repos/pietupai/hae/actions/workflows/142889037/dispatches';

                const response = await fetch(githubUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `token ${apiKey}`
                    },
                    body: data
                });
                if (response.ok) {
                    res.status(200).send('Request sent successfully!');
                } else {
                    const text = await response.text();
                    res.status(response.status).send(`Error sending the request: ${text}`);
                }
            } catch (error) {
                res.status(500).send(`Error sending the request: ${error.message}`);
            }
        });
    } else {
        // Handle other methods if necessary
        res.status(405).send('Method Not Allowed');
    }
};
