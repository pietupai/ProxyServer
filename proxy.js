const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Set CORS headers as per Vercel support suggestion
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method === 'GET') {
        console.log('Received a GET request');

        const { url } = req.query;
        if (!url) {
            res.status(400).json({ error: 'Missing url parameter' });
            return;
        }

        try {
            console.log(`Fetching content from URL: ${url}`);
            const response = await fetch(url);
            const content = await response.text();
            res.status(response.status).send(content);
        } catch (error) {
            console.error(`Error fetching the URL: ${error.message}`);
            res.status(500).json({ error: `Error fetching the URL: ${error.message}` });
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
