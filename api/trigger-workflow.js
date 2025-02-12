const fetch = require('node-fetch');

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
        // Handle preflight requests
        return res.status(200).end();
    }

    const apiKey = process.env.GITHUB_API_KEY; // Ensure you set this in your Vercel environment variables
    const { url } = req.body;
    const data = JSON.stringify({
        ref: 'main',
        inputs: { url: url }
    });
    const githubUrl = 'https://api.github.com/repos/petehuu/hae/actions/workflows/142889037/dispatches';

    fetch(githubUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${apiKey}`
        },
        body: data
    })
    .then(response => {
        if (response.ok) {
            res.status(200).send('Request sent successfully!');
        } else {
            response.text().then(text => {
                res.status(response.status).send(`Error sending the request: ${text}`);
            });
        }
    })
    .catch(error => {
        res.status(500).send(`Error sending the request: ${error.message}`);
    });
};
