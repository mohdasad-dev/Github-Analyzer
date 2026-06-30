const rateLimit = require('express-rate-limit');
const pool = require('../config/database');

/**
 * Rate limiter for API analyze endpoint
 * Prevents abuse of GitHub API calls
 */
const analyzeRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: {
    success: false,
    error: 'Too many analysis requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for authenticated requests (if implemented)
    return false;
  }
});

/**
 * General API rate limiter
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Logging middleware to track API usage
 */
const logApiUsage = async (req, res, next) => {
  const startTime = Date.now();

  // Override res.json to log after response is sent
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    logToDatabase(req, res, responseTime);
    return originalJson(data);
  };

  next();
};

/**
 * Log API request to database
 */
const logToDatabase = async (req, res, responseTime) => {
  try {
    const connection = await pool.getConnection();
    
    const query = `
      INSERT INTO api_logs (username, endpoint, status_code, response_time_ms, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `;

    const username = req.body?.username || req.params?.username || 'anonymous';
    const endpoint = req.path;
    const statusCode = res.statusCode;
    const ipAddress = req.ip;

    await connection.execute(query, [username, endpoint, statusCode, responseTime, ipAddress]);
    connection.release();
  } catch (error) {
    console.error('Logging error:', error.message);
  }
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.details
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    error: `Route "${req.path}" not found`
  });
};

module.exports = {
  analyzeRateLimiter,
  apiRateLimiter,
  logApiUsage,
  errorHandler,
  notFoundHandler
};
