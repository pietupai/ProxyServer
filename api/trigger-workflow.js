const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const apiKey = process.env.GITHUB_API_KEY; // Ensure you set this in your Vercel environment variables
    const { url } = req.body;
    const data = JSON.stringify({
        ref: 'main',
        inputs: { url: url }
    });
    const githubUrl = 'https://api.github.com/repos/petehuu/hae/actions/workflows/142889037/dispatches';

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
        const errorText = await response.text();
        res.status(response.status).send(`Error sending the request: ${response.statusText}\n${errorText}`);
    }
};
