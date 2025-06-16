import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleMapsBusinessScraper } from './gmaps_scraper.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize scraper with default options
const scraper = new GoogleMapsBusinessScraper({
  maxConcurrency: 4,
  useParallel: false, // Start with sequential mode for stability
  headless: true,
  maxResults: 50,
  delay: 2000,
  verbose: true,
  retryLimit: 3,
  timeout: 45000,
  outputFormat: 'json'
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Google Maps scraping endpoint
app.post('/scrape-gmaps', async (req, res) => {
  try {
    const { query, maxResults = 50 } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Missing required parameter: query'
      });
    }

    console.log(`🔍 Starting scrape for query: "${query}" (max ${maxResults} results)`);

    const results = await scraper.scrapeBusinesses(query, maxResults);

    console.log(`✅ Scraping completed! Found ${results.length} businesses`);

    res.json({
      success: true,
      query,
      totalResults: results.length,
      results,
      stats: scraper.stats
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stats: scraper.stats
    });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log('📍 Endpoints:');
  console.log(`   • GET  http://localhost:${port}/health`);
  console.log(`   • POST http://localhost:${port}/scrape-gmaps`);
}); 