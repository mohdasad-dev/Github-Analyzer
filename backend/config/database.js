const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for better performance and concurrency
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'github_analyzer',
  port: process.env.DB_PORT || 46367,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✓ MySQL Database Connected Successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ MySQL Connection Failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
