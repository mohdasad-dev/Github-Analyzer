# GitHub Profile Analyzer API - Architecture & Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUESTS                           │
│  (curl, Postman, Frontend, Mobile App, etc.)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │      EXPRESS.JS SERVER (PORT 5000)       │
    ├──────────────────────────────────────────┤
    │  - Routing (routes/api.js)               │
    │  - Middleware Stack                      │
    │  - Request/Response Handling             │
    └──────────────────┬───────────────────────┘
                       │
        ┌──────────────┼──────────────┬────────────────┐
        │              │              │                │
        ▼              ▼              ▼                ▼
    ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
    │Validation│  │GitHub API│  │Database  │  │Rate Limiting │
    │Middleware│  │Integration│  │Service   │  │   & Logging  │
    └─────────┘  └──────────┘  └──────────┘  └──────────────┘
        │              │              │                │
        └──────────────┼──────────────┴────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────┐
         │    SERVICES LAYER               │
         ├─────────────────────────────────┤
         │ ┌─────────────────────────────┐ │
         │ │ GitHub Service              │ │
         │ │ - fetchUserProfile()        │ │
         │ │ - fetchRepositories()       │ │
         │ │ - analyzeLanguages()        │ │
         │ │ - calculateMetrics()        │ │
         │ └─────────────────────────────┘ │
         │                                 │
         │ ┌─────────────────────────────┐ │
         │ │ Profile Service             │ │
         │ │ - saveProfile()             │ │
         │ │ - saveRepositories()        │ │
         │ │ - getProfileDetails()       │ │
         │ │ - searchProfiles()          │ │
         │ └─────────────────────────────┘ │
         └──────────────┬──────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    ┌─────────────────┐         ┌──────────────────┐
    │ GITHUB API      │         │ MySQL DATABASE   │
    │ (Third Party)   │         │ (Local/Remote)   │
    ├─────────────────┤         ├──────────────────┤
    │ /users/:username│         │ profiles table   │
    │ /repos          │         │ repositories tbl │
    │ /rate_limit     │         │ analysis_history │
    │ etc.            │         │ api_logs table   │
    └─────────────────┘         └──────────────────┘
```

---

## 📊 Request-Response Flow

### Flow 1: Analyze a Profile
```
1. Client sends POST /api/analyze { username: "torvalds" }
                    │
                    ▼
2. Express receives request
                    │
                    ▼
3. Validation Middleware checks input ✓
                    │
                    ▼
4. Rate Limiter checks if within limit ✓
                    │
                    ▼
5. Route Handler calls GitHubService.fetchUserProfile()
                    │
                    ▼
6. GitHub API is called with username
                    │
                    ▼
7. Profile data returned from GitHub
                    │
                    ▼
8. GitHubService.analyzeLanguages() processes repos
                    │
                    ▼
9. GitHubService.calculateMetrics() creates metrics
                    │
                    ▼
10. ProfileService.saveProfile() stores in MySQL
                    │
                    ▼
11. ProfileService.saveRepositories() stores repos
                    │
                    ▼
12. Analysis data logged to api_logs table
                    │
                    ▼
13. Response sent back with profile + metrics + languages
```

### Flow 2: Retrieve Analyzed Profile
```
1. Client sends GET /api/profile/torvalds
                    │
                    ▼
2. Express receives request
                    │
                    ▼
3. Username validation ✓
                    │
                    ▼
4. ProfileService.getProfileWithDetails() called
                    │
                    ├─→ Query: SELECT * FROM profiles WHERE username = ?
                    │
                    ├─→ Query: SELECT * FROM user_repositories WHERE profile_id = ?
                    │
                    └─→ Query: SELECT * FROM analysis_history WHERE profile_id = ?
                    │
                    ▼
5. Data aggregated and parsed (JSON fields)
                    │
                    ▼
6. Response sent with complete profile data
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL GITHUB API                      │
│  (api.github.com - Public API, Rate Limited: 60/hour)      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP GET /users/:username
                       │ HTTP GET /users/:username/repos
                       │
                       ▼
              ┌────────────────────────┐
              │  GITHUB SERVICE        │
              │  (services/gitHub.js)  │
              ├────────────────────────┤
              │ Processes:             │
              │ - Profile data         │
              │ - Repository list      │
              │ - Language analysis    │
              │ - Metric calculations  │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  PROFILE SERVICE       │
              │ (services/profile.js)  │
              ├────────────────────────┤
              │ Handles:               │
              │ - Save to database     │
              │ - Retrieve from DB     │
              │ - Search operations    │
              │ - History tracking     │
              └────────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ MySQL WRITE      │      │ MySQL READ       │
    ├──────────────────┤      ├──────────────────┤
    │ INSERT INTO      │      │ SELECT FROM      │
    │ - profiles       │      │ - profiles       │
    │ - repositories   │      │ - repositories   │
    │ - history        │      │ - analysis_hist  │
    │ - api_logs       │      │ - api_logs       │
    └──────────────────┘      └──────────────────┘
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   RESPONSE DATA        │
              │  (JSON formatted)      │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   CLIENT APPLICATION   │
              │  (Postman, Frontend,   │
              │   Mobile App, etc.)    │
              └────────────────────────┘
```

---

## 🛡️ Middleware Stack Order

```
REQUEST COMES IN
       │
       ▼
1. ┌──────────────────────────────────┐
   │ Helmet (Security Headers)        │
   │ Sets: X-Content-Type-Options,    │
   │       X-Frame-Options, CSP, etc. │
   └──────────────────────────────────┘
       │
       ▼
2. ┌──────────────────────────────────┐
   │ CORS Middleware                  │
   │ Allows/Restricts cross-origin    │
   └──────────────────────────────────┘
       │
       ▼
3. ┌──────────────────────────────────┐
   │ Body Parser                      │
   │ Parses JSON request body         │
   └──────────────────────────────────┘
       │
       ▼
4. ┌──────────────────────────────────┐
   │ API Logging Middleware           │
   │ Logs request start time          │
   └──────────────────────────────────┘
       │
       ▼
5. ┌──────────────────────────────────┐
   │ General Rate Limiter             │
   │ 500 req/15min                    │
   └──────────────────────────────────┘
       │
       ▼
6. ┌──────────────────────────────────┐
   │ Route-Specific Rate Limiter      │
   │ (for /api/analyze endpoint)      │
   │ 100 req/15min                    │
   └──────────────────────────────────┘
       │
       ▼
7. ┌──────────────────────────────────┐
   │ Joi Validation Middleware        │
   │ (if defined for route)           │
   │ Validates: body, params, query   │
   └──────────────────────────────────┘
       │
       ▼
8. ┌──────────────────────────────────┐
   │ Route Handler                    │
   │ Processes request logic          │
   └──────────────────────────────────┘
       │
       ▼
   RESPONSE SENT BACK
```

---

## 📦 Data Model

### Profile Object Structure
```javascript
{
  id: 1,
  github_id: 320,
  username: "torvalds",
  name: "Linus Torvalds",
  bio: "The Linux creator",
  avatar_url: "https://...",
  profile_url: "https://github.com/torvalds",
  
  // Metrics
  public_repos: 50,
  followers: 250000,
  following: 0,
  total_gists: 5,
  public_gists: 5,
  
  // Additional Info
  location: "USA",
  company: "The Linux Foundation",
  blog_url: "https://...",
  email: null,
  is_hireable: true,
  
  // Timestamps
  account_created_at: "2005-04-16T20:20:42Z",
  created_at: "2024-01-20T10:30:00Z",
  updated_at: "2024-01-20T10:30:00Z",
  last_analyzed_at: "2024-01-20T10:30:00Z",
  
  // Status
  analysis_status: "completed",
  error_message: null,
  
  // Nested Data
  repositories: [...],          // From user_repositories table
  analysisHistory: [...]        // From analysis_history table
}
```

### Repository Object Structure
```javascript
{
  id: 1,
  profile_id: 1,
  repo_name: "linux",
  repo_full_name: "torvalds/linux",
  repo_url: "https://github.com/torvalds/linux",
  description: "Linux kernel source tree",
  language: "C",
  stars: 150000,
  forks: 45000,
  watchers: 45000,
  open_issues: 500,
  is_fork: false,
  is_private: false,
  created_at: "2005-04-16T20:20:42Z",
  updated_at: "2024-01-20T10:30:00Z",
  pushed_at: "2024-01-20T09:00:00Z"
}
```

---

## 🗄️ Database Relationships

```
         profiles (1)
            │
            │ (1:N)
            │
            ▼
    user_repositories (Many)
    
    
    profiles (1)
            │
            │ (1:N)
            │
            ▼
    analysis_history (Many)


    profiles (1)
            │
            │ (1:N)
            │
            ▼
    api_logs (Many)
```

---

## 🔌 API Endpoint Overview

```
┌─────────────────────────────────────────────────────────┐
│                   API ENDPOINTS                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  POST   /api/analyze                                   │
│  ├─ Input: { username: string }                        │
│  └─ Output: { profile, metrics, languages }            │
│                                                         │
│  GET    /api/profiles?page=1&limit=20                 │
│  └─ Output: { profiles: [], pagination: {} }          │
│                                                         │
│  GET    /api/profile/:username                        │
│  └─ Output: { full profile + repos + history }        │
│                                                         │
│  GET    /api/profile/:username/repositories           │
│  └─ Output: { repositories: [] }                      │
│                                                         │
│  GET    /api/profile/:username/languages              │
│  └─ Output: { languages: [] }                         │
│                                                         │
│  GET    /api/statistics                               │
│  └─ Output: { aggregate stats }                       │
│                                                         │
│  GET    /api/search?q=query                           │
│  └─ Output: { results: [] }                           │
│                                                         │
│  GET    /api/rate-limit                               │
│  └─ Output: { rate_limit, remaining, reset_at }       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration Flow

```
┌─────────────────────────────────┐
│  environment variables (.env)   │
├─────────────────────────────────┤
│ DB_HOST=localhost               │
│ DB_USER=root                    │
│ DB_PASSWORD=***                 │
│ DB_NAME=github_analyzer         │
│ GITHUB_TOKEN=***                │
│ PORT=5000                       │
│ RATE_LIMIT_WINDOW_MS=900000     │
│ etc.                            │
└────────────────┬────────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ config/database.js   │
      │ - Creates pool       │
      │ - Sets limits        │
      │ - Tests connection   │
      └──────────────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ services/*.js        │
      │ - Uses config        │
      │ - Executes queries   │
      │ - Handles responses  │
      └──────────────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ routes/api.js        │
      │ - Uses services      │
      │ - Returns responses  │
      └──────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│              PRODUCTION DEPLOYMENT                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  OPTION 1: HEROKU                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ Heroku Dyno (Node.js)                          │ │
│  │ + ClearDB (MySQL)                              │ │
│  │ + Environment Variables                        │ │
│  │ + Auto Scaling                                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  OPTION 2: RENDER                                  │
│  ┌────────────────────────────────────────────────┐ │
│  │ Render Web Service (Node.js)                   │ │
│  │ + MySQL Database                               │ │
│  │ + Auto Deploy from GitHub                      │ │
│  │ + Built-in SSL                                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  OPTION 3: AWS                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │ Elastic Beanstalk (Node.js)                    │ │
│  │ + RDS MySQL                                    │ │
│  │ + Load Balancer                                │ │
│  │ + CloudWatch Monitoring                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

```
Current Setup:
- Connection Pool: 10 max connections
- Rate Limiting: 500 req/15min (general), 100 req/15min (analyze)
- Database: Single MySQL instance
- Caching: In-memory (node-cache)

For High Scale:
- Add Redis for distributed caching
- Use read replicas for database
- Implement API gateway with rate limiting
- Add load balancer
- Queue jobs for heavy operations
- Add CDN for static responses
```

---

**This architecture is designed to be:**
- ✅ Scalable
- ✅ Secure
- ✅ Maintainable
- ✅ Performant
- ✅ Production-ready
