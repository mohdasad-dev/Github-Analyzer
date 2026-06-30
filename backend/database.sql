-- Create Database
CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

-- Profile Analysis Table
CREATE TABLE IF NOT EXISTS profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  github_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  profile_url VARCHAR(500),
  location VARCHAR(255),
  company VARCHAR(255),
  blog_url VARCHAR(500),
  email VARCHAR(255),
  
  -- Key Metrics
  public_repos INT DEFAULT 0,
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  total_gists INT DEFAULT 0,
  public_gists INT DEFAULT 0,
  
  -- Advanced Insights
  account_created_at DATETIME,
  last_activity_date DATETIME,
  is_hireable BOOLEAN DEFAULT FALSE,
  has_two_factor_auth BOOLEAN DEFAULT FALSE,
  public_repo_languages JSON,
  
  -- Analysis Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_analyzed_at TIMESTAMP NULL,
  
  -- Analysis Status
  analysis_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  error_message VARCHAR(500),
  
  INDEX idx_username (username),
  INDEX idx_github_id (github_id),
  INDEX idx_created_at (created_at),
  INDEX idx_analysis_status (analysis_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Repository Analysis Table (for detailed insights)
CREATE TABLE IF NOT EXISTS user_repositories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  profile_id INT NOT NULL,
  repo_name VARCHAR(255),
  repo_full_name VARCHAR(500),
  repo_url VARCHAR(500),
  description TEXT,
  language VARCHAR(50),
  stars INT DEFAULT 0,
  forks INT DEFAULT 0,
  watchers INT DEFAULT 0,
  open_issues INT DEFAULT 0,
  is_fork BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at DATETIME,
  updated_at DATETIME,
  pushed_at DATETIME,
  
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_profile_id (profile_id),
  INDEX idx_language (language),
  INDEX idx_stars (stars)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analysis History Table (to track changes over time)
CREATE TABLE IF NOT EXISTS analysis_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  profile_id INT NOT NULL,
  public_repos INT,
  followers INT,
  following INT,
  total_gists INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_profile_id (profile_id),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Activity Log (to track API usage and rate limiting)
CREATE TABLE IF NOT EXISTS api_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255),
  endpoint VARCHAR(255),
  status_code INT,
  response_time_ms INT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_username (username),
  INDEX idx_timestamp (timestamp),
  INDEX idx_endpoint (endpoint)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
