# RankRise Lighthouse Audit Tool - Implementation Guide

## Overview

This implementation uses **Lighthouse** (Google's open-source auditing engine) to provide accurate, fast SEO and performance audits directly from the RankRise website.

**Key Benefits:**
- ✅ **No API key required** (unlike PageSpeed Insights)
- ✅ **Fast audits** (20-30 seconds per page)
- ✅ **Industry standard** (trusted by developers worldwide)
- ✅ **Complete control** (runs on your own infrastructure)
- ✅ **Low cost** (~$20-50/month for small volumes)

---

## Architecture

```
User Browser
    ↓
free-audit.html (frontend)
    ↓
POST /api/audit?url=...
    ↓
server-lighthouse.js (backend)
    ↓
Puppeteer + Lighthouse
    ↓
Chrome (headless)
    ↓
Returns: {categories, audits, opportunities}
```

### Files

| File | Purpose |
|------|---------|
| `server-lighthouse.js` | Node.js backend running Lighthouse audits |
| `package.json` | Dependencies (Lighthouse + Chrome Launcher) |
| `free-audit.html` | Frontend (updated to call `/api/audit`) |
| `AUDIT_TOOL_EVALUATION.md` | Technical comparison of audit tools |
| `IMPLEMENTATION_GUIDE.md` | This file |

---

## Installation

### Step 1: Install Dependencies

```bash
cd /Users/test/teamrankrise
npm install
```

This installs:
- `lighthouse` (11.4.0) - Audit engine
- `chrome-launcher` (1.0.0) - Headless Chrome management

**Time:** ~3-5 minutes (first time)  
**Disk space:** ~350MB (includes Chromium)

### Step 2: Test Locally

```bash
# Start the backend
npm start

# In another terminal, serve the website
cd /Users/test/teamrankrise
python3 -m http.server 8000
```

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║   🚀 RankRise Lighthouse Audit Backend                 ║
╚════════════════════════════════════════════════════════╝

📍 Server running on port 3000
🎯 Audit endpoint: http://localhost:3000/api/audit?url=...
❤️  Health check: http://localhost:3000/health

⚙️  Configuration:
   • Max concurrent audits: 2
   • Rate limit: 10 audits/hour per IP

📊 Ready to accept audit requests...
```

### Step 3: Test the Audit Tool

1. Open http://localhost:8000/free-audit.html
2. Enter a test URL: `https://example.com`
3. Click "Analyze My Site"
4. Wait 20-30 seconds for results

**Expected result:**
- Performance score
- SEO score
- Accessibility score
- Best practices score
- Issues list with pass/fail

---

## Deployment to Production

### Option A: Render.com (Recommended for RankRise)

**Why Render?**
- Simple deployment (connect GitHub repo)
- Auto-scales with traffic
- Free tier available for testing
- Good for small-medium traffic

**Steps:**

1. **Commit code to GitHub**
   ```bash
   cd /Users/test/teamrankrise
   git add -A
   git commit -m "Add Lighthouse audit backend"
   git push origin main
   ```

2. **Create Render.com account**
   - Go to https://render.com
   - Sign up (free account)

3. **Deploy backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select `/Users/test/teamrankrise` as root directory
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: `Node`
   - Add environment variable: `PORT=3000`
   - Click Deploy

4. **Update frontend**
   - Get your Render URL (e.g., `rankrise-audit-backend.onrender.com`)
   - Update `free-audit.html` to use this URL:
   ```javascript
   var apiUrl = 'https://rankrise-audit-backend.onrender.com/api/audit?url=' + encodeURIComponent(url);
   ```
   - Commit and push

5. **Deploy website**
   - Use Netlify, Vercel, or GitHub Pages for static files
   - Or deploy everything to Render

**Cost:** Free tier (~1 instance, auto-sleeps), $7/month paid tier

---

### Option B: Railway.app

**Why Railway?**
- Super easy deployment
- Generous free tier (500 hours/month)
- PostgreSQL/MongoDB support (future)

**Steps:**

1. **Create Railway.app account**
   - Go to https://railway.app
   - Sign up (free account)

2. **Deploy with CLI**
   ```bash
   npm install -g railway
   railway login
   cd /Users/test/teamrankrise
   railway init
   railway up
   ```

3. **Get the public URL**
   - Goes to your Railway dashboard
   - Copy the public domain

4. **Update frontend** (same as above)

**Cost:** Free tier (500 hrs/month = ~21 days of 24/7 usage), then $5-20/month

---

### Option C: AWS Lambda (Advanced)

**Why Lambda?**
- Scales automatically
- Pay-per-use ($0.20 per million requests)
- Good for very high volume

**Steps:**
1. Install AWS CLI and configure credentials
2. Install Serverless Framework: `npm install -g serverless`
3. Create serverless.yml configuration
4. Deploy: `serverless deploy`

**Cost:** $1-50/month depending on volume

---

### Option D: Self-Hosted VPS

**For complete control, use a VPS:**

1. **Get a VPS**
   - DigitalOcean: $5-10/month (2GB RAM, 1 CPU)
   - Linode: $5-20/month
   - Hetzner: $3-10/month

2. **SSH into server**
   ```bash
   ssh root@your-vps-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/teamrankrise.git
   cd teamrankrise
   npm install
   ```

5. **Use PM2 to keep process running**
   ```bash
   npm install -g pm2
   pm2 start server-lighthouse.js --name "rankrise-audit"
   pm2 startup
   pm2 save
   ```

6. **Set up Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name audit-api.teamrankrise.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

7. **Add SSL with Certbot**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d audit-api.teamrankrise.com
   ```

---

## Monitoring & Maintenance

### Health Check Endpoint

Monitor the backend health:
```bash
curl https://your-backend.com/health
```

Returns:
```json
{
  "status": "ok",
  "activeAudits": 1,
  "queuedAudits": 3,
  "timestamp": "2026-02-16T12:34:56.789Z"
}
```

### Logs

**Render.com:**
- Check "Logs" tab in dashboard
- Real-time streaming

**Railway:**
- Check "Logs" in project dashboard

**Self-hosted:**
```bash
pm2 logs rankrise-audit
pm2 monit
```

### Common Issues

**Problem:** "Chrome crashed" or "Out of memory"
- **Solution:** Reduce `MAX_CONCURRENT` (default: 2)
- Edit: `MAX_CONCURRENT=1 npm start`

**Problem:** "Audits timing out" (>120 seconds)
- **Solution:** URL is too slow or offline
- Lighthouse times out after ~30 seconds
- Gracefully handled with error fallback

**Problem:** "High CPU usage"
- **Solution:** Lighthouse is CPU-intensive
- Run during off-peak hours
- Increase server resources

---

## Configuration

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3000 | Server port |
| `MAX_CONCURRENT` | 2 | Max simultaneous audits |
| `RATE_LIMIT_PER_IP` | 10 | Audits per IP per hour |

**Example:**
```bash
PORT=3001 MAX_CONCURRENT=4 RATE_LIMIT_PER_IP=20 npm start
```

---

## Performance Tuning

### For Small Volume (< 100 audits/day)
```bash
MAX_CONCURRENT=2 npm start
```
- Cost: $20-30/month
- Uptime: 99%

### For Medium Volume (100-500 audits/day)
```bash
MAX_CONCURRENT=4 npm start
# On 2GB RAM VPS or Render paid tier
```
- Cost: $30-50/month
- Uptime: 99.5%

### For High Volume (500+ audits/day)
- Use Redis + Bull queue system
- Multiple backend instances
- Cost: $100-300/month
- Uptime: 99.9%

---

## Testing Checklist

Before going live, test:

- [ ] Backend starts without errors
- [ ] Health endpoint responds
- [ ] Audit runs and completes (20-30s)
- [ ] Results display correctly in frontend
- [ ] Error handling works (invalid URL, timeout)
- [ ] Rate limiting kicks in after 10 requests/hour
- [ ] Lead capture works (email fallback)
- [ ] Mobile responsive
- [ ] CORS headers set correctly

---

## Rollback Plan

If something breaks:

1. **Revert to old backend** (Google PageSpeed)
   ```bash
   git revert [commit-hash]
   git push
   ```

2. **Or temporarily use old server.js**
   - Rename: `server-lighthouse.js` → `server-lighthouse-backup.js`
   - Rename: `server.js.old` → `server.js`
   - Restart backend

3. **Notify users**
   - Update free-audit.html note
   - Remove from service pages temporarily

---

## Next Steps

1. ✅ Install locally and test
2. ✅ Fix any issues
3. ✅ Deploy to staging environment
4. ✅ Run load tests (50 concurrent users)
5. ✅ Deploy to production
6. ✅ Monitor for 24 hours
7. ✅ Announce the improvement to customers

---

## Support

**Questions?**
- Check `AUDIT_TOOL_EVALUATION.md` for technical details
- Review Lighthouse docs: https://github.com/GoogleChrome/lighthouse
- Check server logs for errors

**Want to optimize further?**
- Consider adding Redis queue for high volume
- Implement caching for re-audited domains
- Add historical trend tracking
- Create admin dashboard with audit history

---

**Status:** ✅ Ready for deployment  
**Last Updated:** 2026-02-16 08:33 EST  
**Maintainer:** RankRise Audit Tool Task
