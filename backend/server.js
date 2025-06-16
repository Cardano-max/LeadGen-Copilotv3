import express from 'express';
import cors from 'cors';
import { GoogleMapsBusinessScraper } from './gmaps_scraper.js';

const app = express();
const port = process.env.PORT || 10000;

// Enhanced CORS for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://leadgen-copilot-frontend.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for production
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'LeadGen Copilot API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Google Maps scraping endpoint
app.post('/api/scrape-gmaps', async (req, res) => {
  try {
    const { query, maxResults = 15 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid or missing query parameter',
        message: 'Please provide a valid search query'
      });
    }

    if (maxResults > 100) {
      return res.status(400).json({
        error: 'Max results exceeded',
        message: 'Maximum 100 results allowed per request'
      });
    }

    console.log(`🔍 Starting scrape: "${query}" (max ${maxResults} results)`);

    const scraper = new GoogleMapsBusinessScraper({
      maxConcurrency: 2, // Reduced for free tier
      useParallel: false, // Sequential for stability
      headless: true,
      maxResults: parseInt(maxResults),
      delay: 3000, // Increased delay for production
      verbose: true,
      retryLimit: 2,
      timeout: 60000,
      outputFormat: 'json'
    });

    const results = await scraper.scrapeBusinesses(query, parseInt(maxResults));

    console.log(`✅ Scraping completed: ${results.length} businesses found`);

    res.json({
      success: true,
      query,
      totalResults: results.length,
      results,
      stats: scraper.stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/scrape-gmaps'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 LeadGen Copilot API Server`);
  console.log(`📍 Running on: http://0.0.0.0:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('📋 Available endpoints:');
  console.log(`   • GET  /`);
  console.log(`   • GET  /health`);
  console.log(`   • POST /api/scrape-gmaps`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});