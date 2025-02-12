const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load the configuration from the JSON file
const configPath = path.resolve(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

module.exports = async (req, res) => {
    // Set CORS headers as per Vercel support suggestion
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    const origin = req.headers.origin;

    // Check if the origin is disallowed
    if (config.disallowedOrigins.includes(origin)) {
        res.status(403).json({ error: 'This origin is blacklisted from accessing the proxy.' });
        return;
    }

    // Check if the origin is allowed
    if (!config.allowedOrigins.includes(origin)) {
        res.status(403).json({ error: 'This origin is not allowed to access the proxy.' });
        return;
    }

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method === 'GET') {
        console.log('Received a GET request:', req.query);

        const { url } = req.query;
        if (!url) {
            res.status(400).json({ error: 'Missing url parameter' });
            return;
        }

        // Check if the destination URL is blacklisted
        if (config.disallowedDestinations.includes(url)) {
            res.status(403).json({ error: 'This URL is blacklisted from being proxied.' });
            return;
        }

        // Check if the destination URL is allowed
        if (!config.allowedDestinations.includes(url)) {
            res.status(403).json({ error: 'This URL is not allowed to be proxied.' });
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
