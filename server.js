const http = require('http');
const https = require('https');
const url = require('url');

// API Key should be set in environment
const PAGESPEED_API_KEY = process.env.GOOGLE_API_KEY;
const PORT = process.env.PORT || 3000;

if (!PAGESPEED_API_KEY) {
  console.error('ERROR: GOOGLE_API_KEY environment variable not set');
  console.error('To fix: export GOOGLE_API_KEY=your_api_key_here');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  // Only accept /api/pagespeed endpoint
  if (parsedUrl.pathname !== '/api/pagespeed') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const targetUrl = parsedUrl.query.url;
  if (!targetUrl) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Missing url parameter' }));
    return;
  }

  // Build the Google PageSpeed API URL
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&category=seo&category=performance&category=accessibility&category=best-practices&strategy=mobile&key=${PAGESPEED_API_KEY}`;

  console.log(`[${new Date().toISOString()}] Analyzing: ${targetUrl}`);

  // Fetch from Google API
  https.get(apiUrl, (googleRes) => {
    let data = '';

    googleRes.on('data', (chunk) => {
      data += chunk;
    });

    googleRes.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        
        // Check for API errors
        if (parsedData.error) {
          console.error(`API Error for ${targetUrl}:`, parsedData.error);
          res.writeHead(googleRes.statusCode || 400);
          res.end(JSON.stringify(parsedData));
          return;
        }

        res.writeHead(200);
        res.end(data);
      } catch (e) {
        console.error(`Parse error for ${targetUrl}:`, e.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to parse API response' }));
      }
    });
  }).on('error', (err) => {
    console.error(`Request error for ${targetUrl}:`, err.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'Failed to reach Google API', details: err.message }));
  });
});

server.listen(PORT, () => {
  console.log(`✅ RankRise PageSpeed API proxy listening on port ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/pagespeed?url=...`);
  console.log(`🔑 Using API key: ${PAGESPEED_API_KEY.substring(0, 10)}...`);
});
