const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/api/get-response', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com/repos/pietupai/hae/contents/response.txt');
    const data = await response.json();
    const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');
    res.status(200).send(decodedContent);
  } catch (error) {
    console.error('Error fetching response.txt:', error);
    res.status(500).json({ message: 'Error fetching response.txt' });
  }
});

module.exports = app;
