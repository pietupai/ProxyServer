import fetch from 'node-fetch';

const apiKey = process.env.GITHUB_API_KEY;

export default async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${apiKey}`
            }
        });
        const data = await response.text();
        res.status(response.status).send(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
