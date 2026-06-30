# 🚀 GitHub Profile Analyzer

A full-stack GitHub Profile Analyzer that fetches and analyzes public GitHub profiles using the GitHub REST API. The application provides detailed developer insights, repository analytics, language statistics, and stores all analyzed data in a MySQL database for future reference.

---

## 📌 Overview

GitHub Profile Analyzer is designed to help developers, recruiters, and organizations quickly analyze any public GitHub profile. Instead of manually browsing GitHub, users can simply enter a GitHub username and receive comprehensive insights about repositories, programming languages, stars, forks, followers, and more.

The project follows a clean client-server architecture where the frontend interacts with a RESTful backend API. The backend communicates with GitHub, processes repository data, calculates metrics, and stores everything in MySQL for historical tracking and future analysis.

---

# ✨ Features

## Frontend

- 🔍 Search any public GitHub username
- 👤 Display developer profile information
- 📂 Repository listing
- 📊 Language distribution
- ⭐ Repository statistics
- 📱 Responsive UI
- ⚡ Fast API integration
- ❌ Error handling and loading states

---

## Backend

### GitHub API Integration

- Fetch public GitHub profile
- Fetch repositories
- Analyze repository data
- Fetch GitHub API rate limit

### Developer Analytics

- Total repositories
- Total stars
- Total forks
- Average stars per repository
- Most starred repository
- Most forked repository
- Followers & Following
- Public gists
- Programming language distribution

### Database Storage

Stores:

- GitHub Profile
- Repository Information
- Language Analysis
- Analysis History
- API Activity Logs

### Validation

- Request validation using Joi
- GitHub username validation
- Error handling
- Input sanitization

---

# 🛠 Tech Stack

## Frontend

- React
- Tailwind CSS

## Backend

- Node.js
- Express.js
- MySQL
- GitHub REST API
- Axios
- Joi
- dotenv
- mysql2

---

# 🗄 Database Schema

The project uses **MySQL** with the following tables:

### profiles

Stores:

- GitHub ID
- Username
- Name
- Bio
- Avatar
- Profile URL
- Followers
- Following
- Public Repositories
- Public Gists
- Company
- Location
- Email
- Blog
- Hireable Status
- Account Created Date

---

### user_repositories

Stores:

- Repository Name
- Repository URL
- Description
- Language
- Stars
- Forks
- Watchers
- Open Issues
- Created Date
- Updated Date
- Last Push Date

---

### analysis_history

Tracks:

- Repository Count
- Followers
- Following
- Gists
- Analysis Timestamp

---

### api_logs

Tracks:

- Username
- API Endpoint
- Status Code
- Response Time
- Timestamp

---

# 📂 Project Structure

```text
github-profile-analyzer/
│
├── config/
│   ├── database.js
│
├── middleware/
│   ├── validation.js
│
├── routes/
│   ├── profileRoutes.js
│
├── services/
│   ├── githubService.js
│   ├── profileService.js
│
├── database.sql
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

# 🔄 Project Workflow

```text
User

↓

Frontend

↓

Express REST API

↓

GitHub REST API

↓

Repository Analysis

↓

Developer Metrics Calculation

↓

MySQL Database

↓

JSON Response

↓

Frontend Dashboard
```

---

# 📡 REST API Endpoints

| Method | Endpoint | Description |
|----------|-----------------------------|--------------------------------------|
| POST | `/api/analyze` | Analyze GitHub Profile |
| GET | `/api/profiles` | Get All Analyzed Profiles |
| GET | `/api/profile/:username` | Get Detailed Profile |
| GET | `/api/profile/:username/repositories` | Get User Repositories |
| GET | `/api/profile/:username/languages` | Get Language Distribution |
| GET | `/api/search?q=username` | Search Profiles |
| GET | `/api/statistics` | Overall Statistics |
| GET | `/api/rate-limit` | GitHub API Rate Limit |
| GET | `/health` | Health Check |

---

# 📥 Installation

## Clone Repository

```bash
git clone https://github.com/mohdasad-dev/Github-Analyzer.git
```

---

## Navigate to Project

```bash
cd github-profile-analyzer
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5001

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer

GITHUB_TOKEN=your_github_personal_access_token
```

---

## Create Database

```bash
mysql -u root < database.sql
```

---

## Run Development Server

```bash
npm run dev
```

---

# 📊 Example API Response

```json
{
  "success": true,
  "data": {
    "profile": {},
    "repositories": [],
    "analysisHistory": []
  }
}
```

---

# 📈 Skills Demonstrated

- REST API Development
- Backend Architecture
- Service Layer Design
- GitHub API Integration
- MySQL Database Design
- CRUD Operations
- Data Analytics
- Repository Analysis
- Request Validation
- Error Handling
- Environment Configuration
- JSON APIs
- Clean Code Principles

---

# 🚀 Future Improvements

- JWT Authentication
- GitHub OAuth Login
- Redis Caching
- Docker Support
- Swagger API Documentation
- Charts & Graphs
- Export Reports (PDF/CSV)
- Email Notifications
- CI/CD Pipeline
- Unit Testing
- Integration Testing

---

# 👨‍💻 Author

**Md Asad**

**Full Stack Developer | MERN Stack Developer**

### GitHub

https://github.com/mohdasad-dev

### LinkedIn

https://www.linkedin.com/in/md-asad-dev/

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub. It helps others discover the project and supports future development.

---

## 📄 License

This project is licensed under the MIT License.
