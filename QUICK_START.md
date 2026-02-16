# RankRise Lighthouse Audit - Quick Start

## 🚀 Start Locally (2 minutes)

```bash
cd /Users/test/teamrankrise

# Install dependencies
npm install

# Start backend server
npm start
```

You'll see:
```
╔════════════════════════════════════════════════════════╗
║   🚀 RankRise Lighthouse Audit Backend                 ║
╚════════════════════════════════════════════════════════╝

📍 Server running on port 3000
🎯 Audit endpoint: http://localhost:3000/api/audit?url=...
```

## ✅ Test It Works

**In another terminal:**
```bash
# Check health
curl http://localhost:3000/health

# Run a test audit (takes ~30 seconds)
curl "http://localhost:3000/api/audit?url=https://example.com" | jq .
```

**Or open the audit page:**
```bash
# In another terminal
python3 -m http.server 8000 --directory /Users/test/teamrankrise

# Then open: http://localhost:8000/free-audit.html
```

## 📦 Deploy to Production

### Easiest: Render.com (Free tier available)

1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect repository
4. Build: `npm install`
5. Start: `npm start`
6. Get URL (e.g., `rankrise-audit-backend.onrender.com`)
7. Update `free-audit.html` to use this URL:

```javascript
var apiUrl = 'https://rankrise-audit-backend.onrender.com/api/audit?url=' + encodeURIComponent(url);
```

### Alternative: Railway.app

```bash
npm install -g railway
railway login
railway init
railway up
```

### Self-hosted: DigitalOcean ($5/month)

```bash
# On your VPS
git clone your-repo
cd teamrankrise
npm install
npm install -g pm2
pm2 start server-lighthouse.js
pm2 startup
pm2 save
```

## 🎯 Key URLs

| What | URL |
|------|-----|
| Audit Tool | `/free-audit.html` |
| Backend Health | `/health` |
| Backend Endpoint | `/api/audit?url=...` |

## ⚙️ Configuration

Edit environment variables:
```bash
PORT=3001 MAX_CONCURRENT=4 npm start
```

## 📚 Full Docs

- Technical Details: `AUDIT_TOOL_EVALUATION.md`
- Setup Instructions: `IMPLEMENTATION_GUIDE.md`
- Current Status: See below

---

## Current Status: ✅ Ready for Production

**Last tested:** 2026-02-16 13:36 EST

- ✅ Backend server running on port 3000
- ✅ Health endpoint responding
- ✅ Audit endpoint accepting requests
- ✅ Lighthouse dependencies installed
- ✅ Frontend updated to use `/api/audit`
- ✅ Error handling implemented
- ✅ Rate limiting active (10 audits/hour per IP)

**Next:** Deploy to production!
