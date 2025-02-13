import fetch from 'node-fetch';

export default async (req, res) => {
    const { url } = req.query;
    const token = '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';

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const data = await response.text();
        res.status(response.status).send(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
