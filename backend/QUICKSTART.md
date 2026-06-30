# Quick Start Guide - 5 Minutes to Running API

## ⚡ Super Quick Setup

### Step 1: Install Dependencies (2 minutes)
```bash
cd github-analyzer-api
npm install
```

### Step 2: Setup MySQL Database (1 minute)
```bash
# Open MySQL
mysql -u root -p

# Copy & paste the entire database.sql content and run it
source database.sql

# Exit MySQL
exit
```

### Step 3: Configure Environment (1 minute)
```bash
# Copy example env
cp .env.example .env

# Edit .env file with your details (nano, vim, or any editor)
nano .env
```

**Minimum required in .env:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer
PORT=5000
```

### Step 4: Start Server (1 minute)
```bash
npm run dev
```

✅ Done! Server running at `http://localhost:5000`

---

## 🧪 Test It Immediately

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"success": true, "message": "Server is running"}
```

### Test 2: Analyze a Profile
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "octocat"}'
```

### Test 3: Get Analyzed Profile
```bash
curl http://localhost:5000/api/profile/octocat
```

### Test 4: Get All Profiles
```bash
curl http://localhost:5000/api/profiles
```

---

## 🎯 Common Issues & Solutions

### Issue: "Cannot find module 'mysql2'"
**Solution:**
```bash
npm install mysql2 --save
```

### Issue: "Error: connect ECONNREFUSED"
**Solution:** Make sure MySQL is running
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# Windows
net start MySQL80
```

### Issue: "Error: Unknown database 'github_analyzer'"
**Solution:** Run database setup again
```bash
mysql -u root -p < database.sql
```

### Issue: "Port 5000 already in use"
**Solution:** Change port in .env
```
PORT=5001
```

### Issue: "GitHub API Rate Limited"
**Solution:** Add GitHub token to .env
```
GITHUB_TOKEN=your_github_personal_access_token
```

Get token from: https://github.com/settings/tokens

---

## 📖 API Reference (Quick)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyze` | Analyze GitHub user |
| GET | `/api/profiles` | List all profiles |
| GET | `/api/profile/:username` | Get profile details |
| GET | `/api/profile/:username/repositories` | Get user repos |
| GET | `/api/profile/:username/languages` | Get languages used |
| GET | `/api/statistics` | Get stats |
| GET | `/api/search` | Search profiles |

---

## 🔗 Useful URLs

- **API Root**: http://localhost:5000/
- **Docs**: http://localhost:5000/
- **Health**: http://localhost:5000/health

---

## 📱 Test with Postman

1. Download Postman: https://www.postman.com/downloads/
2. Create new workspace
3. Import collection:
   - Method: **POST**
   - URL: `http://localhost:5000/api/analyze`
   - Body (JSON): `{"username": "octocat"}`
   - Send

---

## 🚀 Next: Deploy to Production

After testing locally, deploy with one click:

### Option 1: Heroku (easiest)
```bash
heroku create your-app-name
heroku addons:create cleardb:ignite
git push heroku main
```

### Option 2: Render
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### Option 3: Railway
```bash
npm i -g @railway/cli
railway init
railway up
```

---

## 💡 Pro Tips

1. **Monitor database**:
   ```bash
   mysql -u root -p -e "SELECT COUNT(*) FROM github_analyzer.profiles;"
   ```

2. **Check logs**: Look for errors in console

3. **Test rate limiting**: Spam analyze endpoint - should get 429 after limit

4. **Analyze top devs**:
   ```bash
   # Save to file
   for user in torvalds gvanrossum octocat dhh ayojs; do
     curl -X POST http://localhost:5000/api/analyze \
       -H "Content-Type: application/json" \
       -d "{\"username\": \"$user\"}"
     sleep 2
   done
   ```

---

## 📞 Getting Help

1. Check `.env` file is correct
2. Make sure MySQL is running
3. Check `database.sql` was imported
4. Read `README.md` for detailed docs
5. Check `EXAMPLES.md` for usage examples

---

## 🎓 Project Structure

```
your-project/
├── server.js              ← Start here
├── routes/api.js          ← API endpoints
├── services/
│   ├── githubService.js   ← GitHub API calls
│   └── profileService.js  ← Database operations
├── config/database.js     ← MySQL connection
├── database.sql           ← Schema
└── .env                   ← Your config
```

---

**You're all set! Happy coding! 🎉**

Questions? Check README.md for comprehensive documentation.
