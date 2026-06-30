require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const apiRoutes = require('./routes/api');

// Import middleware
const {
  apiRateLimiter,
  analyzeRateLimiter,
  logApiUsage,
  errorHandler,
  notFoundHandler
} = require('./middleware/errorHandler');

// Import database (to ensure connection test runs)
require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Logging middleware
app.use(logApiUsage);

// Rate limiting
app.use(apiRateLimiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'GitHub Profile Analyzer API',
    version: '1.0.0',
    endpoints: {
      analyze: {
        method: 'POST',
        path: '/api/analyze',
        description: 'Analyze a GitHub user profile',
        body: { username: 'string' },
        rateLimit: 'Applied'
      },
      getAllProfiles: {
        method: 'GET',
        path: '/api/profiles',
        description: 'Get all analyzed profiles with pagination',
        query: {
          page: 'number (default: 1)',
          limit: 'number (default: 20)'
        }
      },
      getProfile: {
        method: 'GET',
        path: '/api/profile/:username',
        description: 'Get detailed profile with repositories and analysis history'
      },
      getRepositories: {
        method: 'GET',
        path: '/api/profile/:username/repositories',
        description: 'Get repositories of a user',
        query: {
          limit: 'number',
          sort: 'stars|forks|created',
          order: 'ASC|DESC'
        }
      },
      getLanguages: {
        method: 'GET',
        path: '/api/profile/:username/languages',
        description: 'Get language distribution of a user'
      },
      getStatistics: {
        method: 'GET',
        path: '/api/statistics',
        description: 'Get overall statistics about analyzed profiles'
      },
      search: {
        method: 'GET',
        path: '/api/search',
        description: 'Search profiles by username or name',
        query: { q: 'string (minimum 2 characters)' }
      },
      rateLimit: {
        method: 'GET',
        path: '/api/rate-limit',
        description: 'Get GitHub API rate limit status'
      }
    }
  });
});

// Apply stricter rate limit to analyze endpoint
app.post('/api/analyze', analyzeRateLimiter);

// API routes
app.use('/api', apiRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   GitHub Profile Analyzer API Running      ║
╠════════════════════════════════════════════╣
║ 🚀 Server: http://localhost:${PORT}
║ 📚 Docs: http://localhost:${PORT}/
║ ❤️  Health: http://localhost:${PORT}/health
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});

module.exports = app;
