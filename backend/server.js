const express = require('express');
const cors = require('cors');
const { scrapeMaps } = require('./gmaps_scraper');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Google Maps scraping endpoint
app.post('/scrape-gmaps', async (req, res) => {
  try {
    const { query, maxResults = 15, mode = 'sequential' } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Starting scrape for "${query}" with maxResults=${maxResults}, mode=${mode}`);
    
    const results = await scrapeMaps(query, maxResults, mode);
    
    res.json({
      results,
      stats: {
        processed: results.length,
        successful: results.length,
        failed: 0
      }
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 