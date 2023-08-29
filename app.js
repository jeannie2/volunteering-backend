const express = require('express');
const cors = require('cors');
const { startScraping } = require('./proxy');

const app = express();
app.use(cors());
app.use(express.json());

let puppeteer;

app.get('/', (req, res) => {
  res.send('Hello, this is the backend server!');
});

app.get('/proxy-endpoint', async (req, res) => {
  try {
    const results = await startScraping();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// app.listen(PORT, "0.0.0.0", function () {
//    console.log(`Server is running on port ${PORT}`);
// })
