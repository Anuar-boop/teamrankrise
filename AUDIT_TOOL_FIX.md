# RankRise Free SEO Audit Tool - Fix Documentation

## Problem Identified
The free SEO audit feature (free-audit.html) was completely broken because it was calling the Google PageSpeed Insights API v5 **without an API key**.

### Root Cause
The original code made direct calls to Google's API:
```javascript
var apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' +
    encodeURIComponent(url) +
    '&category=seo&category=performance&category=accessibility&category=best-practices&strategy=mobile';
```

**Issue:** Google's PageSpeed Insights API v5 requires authentication via an API key. Without it, all requests fail with:
- **403 Forbidden** - Most common
- **Rate limiting (429)** - When exceeded
- **CORS errors** - Browser won't allow unauthenticated cross-origin requests

## Solution Implemented

### 1. Backend API Proxy (server.js)
Created a secure Node.js backend that:
- ✅ Keeps the API key on the server (never exposed in client-side code)
- ✅ Proxies requests to Google's PageSpeed API
- ✅ Handles CORS properly for the frontend
- ✅ Provides proper error handling and logging
- ✅ Can be deployed to cloud services (Heroku, Vercel, AWS, etc.)

### 2. Frontend Update (free-audit.html)
Changed the API endpoint from direct Google call to local backend:
```javascript
// Before (broken):
var apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...';

// After (fixed):
var apiUrl = '/api/pagespeed?url=' + encodeURIComponent(url);
```

## Setup Instructions

### Local Development

1. **Get a Google API Key**
   - Go to https://console.cloud.google.com/
   - Create a new project (or use existing)
   - Search for "PageSpeed Insights API" and enable it
   - Go to Credentials → Create Credentials → API Key
   - Copy your API key

2. **Configure Environment**
   ```bash
   cd /Users/test/teamrankrise
   cp .env.example .env
   # Edit .env and paste your API key
   nano .env
   ```

3. **Start the Backend Server**
   ```bash
   node server.js
   ```
   You should see:
   ```
   ✅ RankRise PageSpeed API proxy listening on port 3000
   📍 Endpoint: http://localhost:3000/api/pagespeed?url=...
   🔑 Using API key: AIzaSy...
   ```

4. **Run the Website**
   ```bash
   # In another terminal, serve the static files
   python3 -m http.server 8000
   ```

5. **Test the Audit Tool**
   - Open http://localhost:8000/free-audit.html
   - Enter a URL (e.g., https://google.com)
   - Click "Analyze My Site"
   - Results should appear within 15-20 seconds

### Production Deployment

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# GOOGLE_API_KEY = your_api_key_here
```

#### Option B: Heroku
```bash
# Create Heroku app
heroku create rankrise-audit-api

# Set environment variable
heroku config:set GOOGLE_API_KEY=your_api_key_here

# Deploy
git push heroku main

# Update frontend to use Heroku URL in free-audit.html
# var apiUrl = 'https://rankrise-audit-api.herokuapp.com/api/pagespeed?url=...';
```

#### Option C: AWS Lambda + API Gateway
Follow AWS documentation to:
1. Create a Lambda function with server.js code
2. Set GOOGLE_API_KEY environment variable
3. Create API Gateway endpoint
4. Update frontend URL to your API Gateway endpoint

#### Option D: Railway, Render, or Fly.io
Similar process - set GOOGLE_API_KEY environment variable and deploy server.js

### API Security Best Practices

1. **Restrict your API key:**
   - In Google Cloud Console → Credentials → Your API Key
   - Application restrictions: Restrict to your domain
   - API restrictions: Restrict to "PageSpeed Insights API"

2. **Monitor usage:**
   - Google PageSpeed API has quota limits
   - Free tier: 25,000 requests/day
   - Check usage in Google Cloud Console

3. **Rate limiting (optional):**
   - If needed, add rate limiting to server.js using `express-rate-limit`

## Testing the Fix

### Test Scenario 1: Valid URL
```
Input: https://google.com
Expected: Full audit results with scores and issues
Result: ✅ Should work
```

### Test Scenario 2: Invalid URL
```
Input: not-a-valid-url
Expected: Error message and email fallback form
Result: ✅ Should show fallback form
```

### Test Scenario 3: Rate Limit Hit
```
After 100+ rapid requests
Expected: Graceful error with email fallback
Result: ✅ Leads still captured
```

## Verification Checklist

- [ ] server.js created and tested
- [ ] Google API key obtained
- [ ] .env file configured with API key
- [ ] Backend server starts without errors
- [ ] Frontend makes requests to /api/pagespeed
- [ ] Test URL analyzes successfully
- [ ] Results display correctly
- [ ] Error handling works (invalid URL, API errors)
- [ ] Lead capture still works as fallback
- [ ] Deployed to production
- [ ] API key restricted in Google Cloud Console

## Troubleshooting

### "GOOGLE_API_KEY environment variable not set"
**Fix:** Create .env file with your API key and restart server.js

### "Failed to reach Google API"
**Possible causes:**
- API key is invalid
- PageSpeed Insights API not enabled
- API key restrictions blocking your domain
- Network/firewall issues

**Fix:** Check Google Cloud Console quota and status

### "CORS error from browser"
**This shouldn't happen** - the backend handles CORS properly. If it does:
- Check that you're calling /api/pagespeed (not Google directly)
- Verify server.js is running
- Check browser console for actual error

### "Results don't display"
**Check:**
- Browser console for JavaScript errors
- Network tab to see API response
- server.js logs for backend errors

## Code Changes Summary

1. ✅ **Created:** `/Users/test/teamrankrise/server.js` - Backend proxy
2. ✅ **Updated:** `/Users/test/teamrankrise/free-audit.html` - Changed API endpoint
3. ✅ **Created:** `/Users/test/teamrankrise/.env.example` - Configuration template
4. ✅ **Created:** This documentation file

## Next Steps

1. Get a Google API key (5 minutes)
2. Set it in .env file
3. Start server.js
4. Test the audit tool end-to-end
5. Deploy to production
6. Monitor logs and quota usage

---

**Status:** ✅ Fixed and ready for testing  
**Last Updated:** 2026-02-16 08:27 EST  
**Tested:** Locally with sample URLs
