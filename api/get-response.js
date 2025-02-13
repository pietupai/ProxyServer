import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

export default async (req, res) => {
  if (req.method === 'POST') {
    const { url } = req.body;

    try {
      // Käynnistä GitHub Actions workflow
      await execPromise(`curl -X POST https://api.github.com/repos/pietupai/hae/dispatches \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token ${process.env.GH_TOKEN_HAE}" \
        -d '{"event_type": "trigger-workflow", "client_payload": {"url": "${url}"}}'`);

      // Pollaa response.txt tiedostoa useita kertoja lyhyemmillä väleillä
      const maxPollCount = 10;
      const pollDelay = 5000; // 5 sekuntia
      let pollCount = 0;
      let decodedContent = '';

      while (pollCount < maxPollCount) {
        // Odota ennen seuraavaa polling-kutsua
        await new Promise(resolve => setTimeout(resolve, pollDelay));
        pollCount++;

        const { stdout } = await execPromise('curl https://api.github.com/repos/pietupai/hae/contents/response.txt');
        const responseData = JSON.parse(stdout);
        decodedContent = Buffer.from(responseData.content, 'base64').toString('utf-8');

        // Tarkista, onko tiedoston sisältö päivitetty
        if (decodedContent) {
          break;
        }
      }

      // Lisää CORS-otsikot
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

      res.status(200).json({ message: decodedContent });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error triggering workflow' });
    }
  } else {
    // Lisää CORS-otsikot
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(405).json({ message: 'Method not allowed' });
  }
};
