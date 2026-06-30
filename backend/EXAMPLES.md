# GitHub Profile Analyzer API - Examples & Advanced Usage

## 🧪 Quick Test Examples

### Basic cURL Examples

#### 1. Analyze a GitHub Profile
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'
```

#### 2. Analyze Multiple Profiles
```bash
# Create a bash loop to analyze multiple users
for user in torvalds gvanrossum octocat; do
  curl -X POST http://localhost:5000/api/analyze \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$user\"}"
  sleep 2  # Avoid rate limiting
done
```

#### 3. Get All Analyzed Profiles (with pagination)
```bash
# Page 1
curl "http://localhost:5000/api/profiles?page=1&limit=10"

# Page 2
curl "http://localhost:5000/api/profiles?page=2&limit=10"
```

#### 4. Get Single Profile Details
```bash
curl http://localhost:5000/api/profile/torvalds
```

#### 5. Get User Repositories (sorted by stars)
```bash
curl "http://localhost:5000/api/profile/torvalds/repositories?limit=50&sort=stars&order=DESC"
```

#### 6. Get User Repositories (sorted by forks)
```bash
curl "http://localhost:5000/api/profile/torvalds/repositories?limit=20&sort=forks&order=DESC"
```

#### 7. Get Language Distribution
```bash
curl http://localhost:5000/api/profile/torvalds/languages
```

#### 8. Get Overall Statistics
```bash
curl http://localhost:5000/api/statistics
```

#### 9. Search Profiles
```bash
curl "http://localhost:5000/api/search?q=linux"
```

#### 10. Check Rate Limits
```bash
curl http://localhost:5000/api/rate-limit
```

---

## 🔧 Advanced Usage Scenarios

### Using the API with Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Analyze a profile
async function analyzeProfile(username) {
  try {
    const response = await axios.post(`${API_BASE}/analyze`, { username });
    console.log('Analysis successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Get profile details
async function getProfile(username) {
  try {
    const response = await axios.get(`${API_BASE}/profile/${username}`);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Search profiles
async function searchProfiles(query) {
  try {
    const response = await axios.get(`${API_BASE}/search`, { params: { q: query } });
    return response.data.data.results;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
(async () => {
  await analyzeProfile('torvalds');
  const profile = await getProfile('torvalds');
  console.log(profile);
})();
```

### Using the API with Python

```python
import requests
import json

API_BASE = 'http://localhost:5000/api'

def analyze_profile(username):
    """Analyze a GitHub profile"""
    response = requests.post(
        f'{API_BASE}/analyze',
        json={'username': username}
    )
    return response.json()

def get_profile(username):
    """Get profile details"""
    response = requests.get(f'{API_BASE}/profile/{username}')
    return response.json()['data']

def get_repositories(username, limit=20):
    """Get repositories"""
    response = requests.get(
        f'{API_BASE}/profile/{username}/repositories',
        params={'limit': limit, 'sort': 'stars', 'order': 'DESC'}
    )
    return response.json()['data']

def get_statistics():
    """Get overall statistics"""
    response = requests.get(f'{API_BASE}/statistics')
    return response.json()['data']

# Usage
if __name__ == '__main__':
    # Analyze profile
    result = analyze_profile('torvalds')
    print(json.dumps(result, indent=2))
    
    # Get profile
    profile = get_profile('torvalds')
    print(f"Followers: {profile['followers']}")
    
    # Get repos
    repos = get_repositories('torvalds')
    for repo in repos['repositories']:
        print(f"- {repo['repo_name']}: {repo['stars']} stars")
```

### Using the API with JavaScript (Fetch API)

```javascript
const API_BASE = 'http://localhost:5000/api';

// Analyze profile
async function analyzeProfile(username) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  return response.json();
}

// Get profile
async function getProfile(username) {
  const response = await fetch(`${API_BASE}/profile/${username}`);
  const data = await response.json();
  return data.data;
}

// Get statistics
async function getStatistics() {
  const response = await fetch(`${API_BASE}/statistics`);
  const data = await response.json();
  return data.data;
}

// Usage
(async () => {
  const profile = await getProfile('torvalds');
  console.log(`${profile.name} has ${profile.followers} followers`);
})();
```

---

## 📊 Real-World Use Cases

### 1. Track Developer Growth Over Time

```bash
#!/bin/bash

# Analyze the same user daily to track growth

USERS=("torvalds" "gvanrossum" "octocat")
LOGFILE="growth_tracking.log"

for user in "${USERS[@]}"; do
  echo "Analyzing $user at $(date)" >> $LOGFILE
  
  response=$(curl -s "http://localhost:5000/api/profile/$user")
  followers=$(echo $response | grep -o '"followers":[0-9]*' | cut -d':' -f2)
  repos=$(echo $response | grep -o '"public_repos":[0-9]*' | cut -d':' -f2)
  
  echo "$user: $followers followers, $repos repos" >> $LOGFILE
done
```

### 2. Compare Developer Statistics

```javascript
const axios = require('axios');

async function compareDevs(usernames) {
  const profiles = await Promise.all(
    usernames.map(u => axios.get(`http://localhost:5000/api/profile/${u}`))
  );

  const comparison = profiles.map(p => p.data.data).map(profile => ({
    username: profile.username,
    followers: profile.followers,
    repos: profile.public_repos,
    stars: profile.repositories?.reduce((sum, r) => sum + r.stars, 0) || 0,
    avgStarsPerRepo: profile.repositories ? 
      (profile.repositories.reduce((sum, r) => sum + r.stars, 0) / profile.repositories.length) : 0
  }));

  console.table(comparison);
  return comparison;
}

compareDevs(['torvalds', 'gvanrossum', 'octocat']);
```

### 3. Find Most Popular Languages in Database

```bash
curl "http://localhost:5000/api/profiles?limit=100" | \
  grep -o '"language":"[^"]*' | \
  cut -d'"' -f4 | \
  sort | uniq -c | sort -rn | head -20
```

### 4. Batch Analysis with Error Handling

```javascript
const axios = require('axios');

async function batchAnalyze(usernames, delayMs = 1000) {
  const results = { success: [], failed: [] };

  for (const username of usernames) {
    try {
      const response = await axios.post('http://localhost:5000/api/analyze', 
        { username }
      );
      results.success.push(username);
      console.log(`✓ ${username} analyzed successfully`);
    } catch (error) {
      results.failed.push({ username, error: error.message });
      console.error(`✗ ${username} failed: ${error.message}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  console.log(`\nResults: ${results.success.length} success, ${results.failed.length} failed`);
  return results;
}

// Usage
const devs = ['torvalds', 'invalid_user', 'gvanrossum', 'octocat'];
batchAnalyze(devs, 1500);
```

---

## 🎯 Performance Tips

### 1. Cache API Responses
```javascript
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

async function getProfileCached(username) {
  const cached = cache.get(username);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(`http://localhost:5000/api/profile/${username}`);
  const data = await response.json();
  
  cache.set(username, { data: data.data, timestamp: Date.now() });
  return data.data;
}
```

### 2. Batch Requests Efficiently
```javascript
async function getMultipleProfiles(usernames) {
  return Promise.all(
    usernames.map(username => 
      fetch(`http://localhost:5000/api/profile/${username}`)
        .then(r => r.json())
        .then(data => data.data)
    )
  );
}

// Usage
const profiles = await getMultipleProfiles(['torvalds', 'gvanrossum', 'octocat']);
```

### 3. Use Pagination
```bash
# Instead of getting all profiles at once
curl "http://localhost:5000/api/profiles?page=1&limit=10"
curl "http://localhost:5000/api/profiles?page=2&limit=10"
curl "http://localhost:5000/api/profiles?page=3&limit=10"
```

---

## 🐛 Debugging Tips

### Enable verbose logging in Node.js
```javascript
const https = require('https');
https.globalAgent.options.rejectUnauthorized = false;

// Enable detailed logging
if (process.env.DEBUG) {
  require('axios').interceptors.request.use(config => {
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  });
}
```

### Check database directly
```bash
# MySQL CLI
mysql -u root -p github_analyzer

# Useful queries
SELECT COUNT(*) FROM profiles;
SELECT username, followers, public_repos FROM profiles ORDER BY followers DESC LIMIT 10;
SELECT language, COUNT(*) as count FROM user_repositories GROUP BY language ORDER BY count DESC;
```

---

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Can analyze a profile
- [ ] Can retrieve all profiles
- [ ] Can get single profile details
- [ ] Repositories fetch correctly
- [ ] Language distribution works
- [ ] Statistics endpoint returns data
- [ ] Search functionality works
- [ ] Rate limiting is active
- [ ] Error handling works for invalid usernames

---

## 🚀 Next Steps

1. Deploy to production (Heroku, Render, DigitalOcean)
2. Add frontend dashboard
3. Implement user authentication
4. Add webhook support for real-time updates
5. Create data visualization dashboard
6. Add export functionality (CSV, PDF)
7. Implement caching layer with Redis
8. Add API key authentication
9. Create admin dashboard
10. Set up automated daily analysis jobs

---

Made with ❤️ by MD Asad
