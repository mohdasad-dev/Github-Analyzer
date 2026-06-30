# GitHub Profile Analyzer API

A production-ready backend service that analyzes GitHub user profiles using the GitHub public API and stores comprehensive insights in a MySQL database.

## 🎯 Features

### Core Features
- ✅ Fetch public profile data from GitHub using username
- ✅ Store comprehensive profile insights in MySQL
- ✅ Analyze repository metrics and language distribution
- ✅ RESTful API to fetch all analyzed profiles
- ✅ Detailed profile view with repositories and analysis history

### Advanced Features
- 🔍 Full-text search on analyzed profiles
- 📊 Statistical analysis across all profiles
- 💾 Analysis history tracking to monitor profile growth
- 🚦 Rate limiting to prevent API abuse
- 📝 Detailed logging of all API requests
- 🔐 Input validation and security middleware
- 🌐 CORS support for frontend integration
- ⚡ Connection pooling for optimal database performance

## 📋 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **External API**: GitHub API v3
- **Validation**: Joi
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet.js
- **Caching**: Node-cache

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ and npm
- MySQL Server (local or remote)
- GitHub Personal Access Token (optional, for higher rate limits)

### Installation

1. **Clone and setup**
```bash
cd github-analyzer-api
npm install
```

2. **Database Setup**
```bash
# Login to MySQL
mysql -u root -p

# Create database and tables
source database.sql
```

3. **Environment Configuration**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=github_analyzer
GITHUB_TOKEN=your_github_token_here
PORT=5000
```

4. **Start the server**
```bash
npm run dev    # Development with auto-reload
npm start      # Production
```

Server will be running at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### 1. Analyze GitHub Profile
**POST** `/api/analyze`

Fetch GitHub profile data and store analysis in database.

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'
```

**Request Body**
```json
{
  "username": "github_username"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "Profile \"torvalds\" analyzed successfully",
  "data": {
    "profile": {
      "username": "torvalds",
      "name": "Linus Torvalds",
      "bio": "...",
      "followers": 250000,
      "public_repos": 50,
      "avatar_url": "...",
      "profile_url": "..."
    },
    "metrics": {
      "total_repositories": 50,
      "total_stars": 125000,
      "total_forks": 45000,
      "average_stars_per_repo": "2500.00",
      "most_starred_repo": {
        "name": "linux",
        "stars": 150000,
        "url": "..."
      }
    },
    "top_languages": [
      {
        "language": "C",
        "count": 35,
        "percentage": "70.00"
      }
    ]
  }
}
```

**Stored Insights Include**
- Public repositories count
- Followers/Following count
- Public/Private gists count
- Repository languages distribution
- Stars and forks analysis
- Top repositories
- Account creation date
- Hireable status
- Company and location information

---

### 2. Get All Analyzed Profiles
**GET** `/api/profiles`

Retrieve all analyzed profiles with pagination.

```bash
curl "http://localhost:5000/api/profiles?page=1&limit=20"
```

**Query Parameters**
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20, max: 100)

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": 1,
        "username": "torvalds",
        "name": "Linus Torvalds",
        "followers": 250000,
        "public_repos": 50,
        "last_analyzed_at": "2024-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### 3. Get Single Profile Details
**GET** `/api/profile/:username`

Get comprehensive profile data including repositories and analysis history.

```bash
curl http://localhost:5000/api/profile/torvalds
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "torvalds",
    "name": "Linus Torvalds",
    "bio": "...",
    "followers": 250000,
    "public_repos": 50,
    "repositories": [
      {
        "repo_name": "linux",
        "repo_full_name": "torvalds/linux",
        "language": "C",
        "stars": 150000,
        "forks": 45000,
        "created_at": "2005-04-16T20:20:42Z"
      }
    ],
    "analysisHistory": [
      {
        "timestamp": "2024-01-20T10:30:00Z",
        "followers": 250000,
        "public_repos": 50
      }
    ]
  }
}
```

---

### 4. Get User Repositories
**GET** `/api/profile/:username/repositories`

Get repositories with sorting and filtering options.

```bash
curl "http://localhost:5000/api/profile/torvalds/repositories?limit=20&sort=stars&order=DESC"
```

**Query Parameters**
- `limit` (number): Number of repos to return (default: 20, max: 100)
- `sort` (string): Sort by `stars`, `forks`, or `created` (default: `stars`)
- `order` (string): `ASC` or `DESC` (default: `DESC`)

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "username": "torvalds",
    "total_repositories": 50,
    "repositories": [
      {
        "repo_name": "linux",
        "stars": 150000,
        "forks": 45000,
        "language": "C"
      }
    ]
  }
}
```

---

### 5. Get Language Distribution
**GET** `/api/profile/:username/languages`

Get programming language distribution across repositories.

```bash
curl http://localhost:5000/api/profile/torvalds/languages
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "username": "torvalds",
    "languages": [
      {
        "language": "C",
        "count": 35,
        "percentage": "70.00"
      },
      {
        "language": "Assembly",
        "count": 10,
        "percentage": "20.00"
      }
    ]
  }
}
```

---

### 6. Get Overall Statistics
**GET** `/api/statistics`

Get aggregate statistics across all analyzed profiles.

```bash
curl http://localhost:5000/api/statistics
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "total_analyzed_profiles": 150,
    "average_followers": "5000.50",
    "average_repositories": "25.30",
    "max_followers": 250000,
    "max_repositories": 200
  }
}
```

---

### 7. Search Profiles
**GET** `/api/search`

Search analyzed profiles by username or name.

```bash
curl "http://localhost:5000/api/search?q=linus"
```

**Query Parameters**
- `q` (string): Search query (minimum 2 characters)

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "query": "linus",
    "count": 5,
    "results": [
      {
        "username": "torvalds",
        "name": "Linus Torvalds",
        "followers": 250000
      }
    ]
  }
}
```

---

### 8. Get GitHub API Rate Limit
**GET** `/api/rate-limit`

Check current GitHub API rate limit status.

```bash
curl http://localhost:5000/api/rate-limit
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "rate_limit": 60,
    "remaining": 45,
    "reset_at": "2024-01-20T11:30:00Z"
  }
}
```

---

## 🗄️ Database Schema

### Tables

#### `profiles`
Stores analyzed GitHub profiles with key metrics.
- Profile information (name, bio, location, company, etc.)
- Public repositories, followers, following counts
- Account creation date
- Analysis status and timestamps

#### `user_repositories`
Stores detailed repository information for each profile.
- Repository name, URL, description
- Programming language
- Stars, forks, watchers counts
- Created, updated, and pushed dates

#### `analysis_history`
Tracks profile metrics over time for growth analysis.
- Snapshots of follower count, repo count, gist count
- Timestamp of each snapshot

#### `api_logs`
Logs all API requests for monitoring and analytics.
- Username, endpoint, status code
- Response time in milliseconds
- IP address and timestamp

---

## 🔒 Security Features

- **Helmet.js**: Sets secure HTTP headers
- **Input Validation**: Joi schema validation for all inputs
- **Rate Limiting**: Prevent abuse with request throttling
- **CORS**: Configurable cross-origin requests
- **Connection Pooling**: Safe database connection management
- **SQL Injection Prevention**: Parameterized queries

---

## 📊 Performance Optimizations

- **Database Indexing**: Indexes on frequently queried columns
- **Connection Pooling**: MySQL connection pool with 10 max connections
- **Pagination**: Limit large result sets
- **JSON Caching**: Language distribution cached as JSON
- **Async Operations**: Non-blocking database operations

---

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Optional", "error", "details"]
}
```

**Common Status Codes**
- `200 OK`: Successful request
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## 🔄 Rate Limiting

- **General API**: 500 requests per 15 minutes
- **Analyze Endpoint**: 100 requests per 15 minutes
- **GitHub API**: Dependent on your token (60 unauthenticated, 5000 authenticated)

---

## 📝 Sample Workflow

```bash
# 1. Analyze a profile
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'

# 2. Fetch all profiles
curl http://localhost:5000/api/profiles

# 3. Get detailed profile
curl http://localhost:5000/api/profile/torvalds

# 4. Get repositories
curl http://localhost:5000/api/profile/torvalds/repositories

# 5. Get language distribution
curl http://localhost:5000/api/profile/torvalds/languages

# 6. Get statistics
curl http://localhost:5000/api/statistics

# 7. Search profiles
curl "http://localhost:5000/api/search?q=linux"
```

---

## 🚀 Deployment

### Using Heroku
```bash
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name
heroku addons:create cleardb:ignite
git push heroku main
```

### Using Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Using DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables
3. Deploy with automatic scaling

---

## 📦 Project Structure

```
github-analyzer-api/
├── config/
│   └── database.js          # MySQL connection pool
├── middleware/
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Error & rate limiting
├── routes/
│   └── api.js              # API endpoints
├── services/
│   ├── githubService.js    # GitHub API integration
│   └── profileService.js   # Database operations
├── database.sql            # Schema
├── server.js               # Express app
├── package.json
├── .env.example
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**MD Asad** - Full-Stack MERN Developer  
GitHub: [@mdasad](https://github.com)

---

## 🆘 Support

For issues and questions, please open an issue in the repository.

---

**Made with ❤️ using Node.js, Express, and MySQL**
