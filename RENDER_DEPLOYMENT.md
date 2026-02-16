# RankRise Lighthouse Audit Tool - Render.com Deployment Guide

## Overview

This guide walks you through deploying the RankRise Lighthouse Audit Tool to Render.com production. The deployment includes:

- **Backend:** Node.js Lighthouse audit server
- **Frontend:** Static HTML/CSS/JS website
- **DNS:** Configuration for teamrankrise.com domain
- **Environment:** Production-grade setup with auto-scaling

---

## Prerequisites

Before starting, ensure you have:

1. **GitHub Account** - The code repo (https://github.com/Anuar-boop/teamrankrise)
2. **Domain** - teamrankrise.com (or your domain)
3. **DNS Access** - Ability to update DNS records for your domain
4. **5-10 minutes** - Time to complete deployment

---

## Part 1: Deploy Backend Server to Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started" (top right)
3. Sign up with GitHub (recommended for easier deployment)
4. Authorize Render to access your GitHub account
5. You'll be redirected to the Render dashboard

### Step 2: Create Backend Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Choose your repository: `teamrankrise`
3. Fill in the form:
   - **Name:** `rankrise-audit-backend`
   - **Region:** Select closest to your users (e.g., "US East")
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (for testing) or Starter ($7/month for production)

4. Click **"Create Web Service"**

### Step 3: Configure Environment Variables

Render will automatically detect that this is a Node.js project.

1. In the new service dashboard, go to **"Environment"** tab
2. Add environment variables:
   - **PORT:** `3000` (already set by Render, but ensure it's correct)
   - **MAX_CONCURRENT:** `2` (adjust based on your plan)
   - **RATE_LIMIT_PER_IP:** `10` (audits per hour per IP)

3. Click **"Save"**

### Step 4: Wait for Deployment

- Render will automatically build and deploy your backend
- Watch the "Logs" tab to see build progress
- You'll see messages like:
  ```
  === Building your application
  npm install
  npm start
  
  📍 Server running on port 3000
  🎯 Audit endpoint: http://localhost:3000/api/audit?url=...
  ```

- Once you see "Server running", the deployment is complete

### Step 5: Get Your Backend URL

1. Go to the service overview page
2. Copy the public URL (looks like: `https://rankrise-audit-backend.onrender.com`)
3. Save this - you'll need it for the frontend

**✅ Backend deployed!**

---

## Part 2: Deploy Frontend (Static Website)

### Option A: Deploy Static Site to Render (Simplest)

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Choose your repository: `teamrankrise`
3. Fill in the form:
   - **Name:** `rankrise-website`
   - **Branch:** `main`
   - **Build Command:** (leave empty - already built)
   - **Publish Directory:** `./` (root directory)

4. Click **"Create Static Site"**
5. Wait for deployment (should be instant since it's just HTML/CSS/JS)
6. Copy the static site URL (looks like: `https://rankrise-website.onrender.com`)

### Option B: Use Vercel or Netlify (Faster)

If you prefer faster frontend deployment:

**Netlify:**
1. Go to https://netlify.com
2. Click "New site from Git"
3. Choose your `teamrankrise` repo
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `./`
5. Click Deploy

**Vercel:**
1. Go to https://vercel.com
2. Click "New Project"
3. Import `teamrankrise` repo
4. Skip build steps (static site)
5. Deploy

---

## Part 3: Update Frontend to Use Backend

The frontend needs to know where the backend API is located.

### Update API Endpoint

1. Open `free-audit.html` in your editor
2. Find the line with `var apiUrl` (around line 487)
3. The code already has dynamic detection:
   ```javascript
   var apiBase = window.location.hostname === 'localhost' 
       ? '/api/audit' 
       : 'https://rankrise-audit-backend.onrender.com/api/audit';
   var apiUrl = apiBase + '?url=' + encodeURIComponent(url);
   ```

4. Update the Render backend URL if it's different from `rankrise-audit-backend.onrender.com`
5. Save and commit:
   ```bash
   git add free-audit.html
   git commit -m "Update backend URL for production"
   git push
   ```

6. Redeploy frontend (automatic if using Render)

---

## Part 4: Configure DNS for teamrankrise.com

### Option A: Point Domain to Render Static Site

1. Get your Render static site URL from the dashboard
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Update DNS records:
   - **CNAME:** `teamrankrise.com` → `cname.onrender.com` (Render provides this)
   - Or update **A records** to point to Render's IP

4. Wait 5-30 minutes for DNS propagation

### Option B: Use Render Custom Domain Feature

1. In Render static site dashboard, go to **"Settings"**
2. Click **"Add Custom Domain"**
3. Enter: `teamrankrise.com`
4. Follow Render's instructions to update DNS

### Option C: Keep Current Setup + API Routing

If teamrankrise.com is currently hosted elsewhere:

1. Keep your current website hosting
2. Update the website files to point to the Render backend:
   ```javascript
   var apiBase = 'https://rankrise-audit-backend.onrender.com/api/audit';
   ```

3. This allows the frontend to be anywhere and still use the Render backend

---

## Part 5: Enable CORS for Cross-Origin Requests

If frontend and backend are on different domains, ensure CORS is enabled.

The backend (`server-lighthouse.js`) already has CORS enabled:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

This allows requests from any origin. For production, you can restrict it:

1. Edit `server-lighthouse.js`
2. Change line 48 from:
   ```javascript
   res.setHeader('Access-Control-Allow-Origin', '*');
   ```
   To:
   ```javascript
   res.setHeader('Access-Control-Allow-Origin', 'https://teamrankrise.com');
   ```

3. Commit and push
4. Render will auto-redeploy

---

## Part 6: Testing

### Test Backend Health

```bash
curl https://rankrise-audit-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "activeAudits": 0,
  "queuedAudits": 0,
  "timestamp": "2026-02-16T14:30:00.000Z"
}
```

### Test Audit Endpoint

```bash
curl "https://rankrise-audit-backend.onrender.com/api/audit?url=https://example.com"
```

Expected response: Lighthouse audit results

### Test Frontend

1. Visit your website at teamrankrise.com (or local URL)
2. Go to `/free-audit.html` page
3. Enter a URL: `https://example.com`
4. Click "Analyze My Site"
5. Wait 20-30 seconds for results
6. You should see:
   - Performance score
   - SEO score
   - Accessibility score
   - Best practices score
   - Issues list

---

## Part 7: Monitor & Manage

### View Logs

**In Render Dashboard:**
1. Go to your service
2. Click **"Logs"** tab
3. Watch real-time logs as audits run

### View Metrics

1. Click **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Scale Resources

If getting high load:

1. Go to service **"Settings"**
2. Under "Instance Type", upgrade from Free/Starter
3. Increase `MAX_CONCURRENT` environment variable
4. Render will automatically handle scaling

---

## Troubleshooting

### Issue: "Chrome crashed" or Out of Memory

**Solution:**
1. Reduce `MAX_CONCURRENT` to 1
2. Or upgrade to a paid plan with more RAM
3. Or deploy multiple backend instances with load balancing

### Issue: Audits Timing Out

**Solution:**
1. This is normal for very slow sites (Lighthouse timeout is ~30s)
2. Frontend shows graceful error and lead capture form
3. User can still submit email to get full audit later

### Issue: Slow Response Times

**Cause:** Free tier Render instances "sleep" after inactivity
**Solution:** Upgrade to Starter plan ($7/month) for always-on instances

### Issue: CORS Errors

**Solution:**
1. Ensure backend has CORS headers
2. Check that domain URLs are correct
3. Clear browser cache
4. Test with: `curl -i -X OPTIONS https://your-backend.com/api/audit`

### Issue: DNS Not Working

**Solution:**
1. Check DNS propagation: `nslookup teamrankrise.com`
2. May take 5-48 hours to fully propagate
3. Try accessing via IP directly from DNS records
4. Contact your domain registrar if stuck

---

## Performance Tuning

### For Development (Free Tier)
- `MAX_CONCURRENT=1`
- `RATE_LIMIT_PER_IP=5`
- Expected response time: 25-35 seconds

### For Small Production (Starter, $7/month)
- `MAX_CONCURRENT=2`
- `RATE_LIMIT_PER_IP=20`
- Expected response time: 20-30 seconds
- Can handle ~100-500 audits/day

### For Medium Production (Standard, $20/month)
- `MAX_CONCURRENT=4`
- `RATE_LIMIT_PER_IP=50`
- Expected response time: 15-25 seconds
- Can handle ~500-1000 audits/day

### For High Volume (Pro+, $50+/month)
- Multiple backend instances
- Redis queue for job processing
- Expected response time: 10-20 seconds
- Can handle 1000+ audits/day

---

## Monitoring Checklist

- [ ] Backend health check responds (health endpoint)
- [ ] Audit API works (test with example.com)
- [ ] Frontend loads at teamrankrise.com
- [ ] Free audit page is accessible
- [ ] Audit runs and completes in 20-30 seconds
- [ ] Results display correctly
- [ ] Error handling works (invalid URL, timeout)
- [ ] Rate limiting active (10 requests/hour per IP)
- [ ] Lead capture email fallback working
- [ ] Mobile responsive on all screen sizes
- [ ] No CORS errors in browser console
- [ ] Logs show no errors or warnings

---

## Rollback Plan

If something breaks:

### Quick Rollback
```bash
# Revert to previous version
git revert [commit-hash]
git push

# Render automatically redeploys
```

### Manual Rollback in Render
1. Go to service dashboard
2. Click **"Deploys"** tab
3. Find previous successful deploy
4. Click **"Redeploy"**

### Emergency: Use Old Backend
1. In free-audit.html, revert API URL:
   ```javascript
   var apiBase = '/api/audit'; // Local only
   ```
2. This disables the frontend feature temporarily
3. Commit and push
4. Website still works, just no audit tool

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Render (or Vercel/Netlify)
3. ✅ Configure DNS for teamrankrise.com
4. ✅ Test all functionality
5. ✅ Monitor for 24 hours
6. ✅ Update customer-facing pages with new audit page link

---

## Support Resources

- **Render Docs:** https://docs.render.com
- **Lighthouse Docs:** https://github.com/GoogleChrome/lighthouse
- **Node.js Docs:** https://nodejs.org/docs

---

## Production Checklist

Before going live to customers:

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] DNS configured (if using teamrankrise.com)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Error handling tested
- [ ] Lead capture fallback working
- [ ] Audit results displaying correctly
- [ ] Mobile responsive tested
- [ ] Performance acceptable (<30s per audit)
- [ ] Monitoring/logging active
- [ ] Backup/rollback plan ready

---

**Status:** ✅ Ready for Deployment  
**Last Updated:** 2026-02-16  
**Deployment Type:** Render.com + Static Frontend  
**Expected Deployment Time:** 10-15 minutes
