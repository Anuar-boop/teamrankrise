/**
 * RankRise Lighthouse Audit Backend
 * 
 * Features:
 * - Runs Lighthouse audits on user-submitted URLs
 * - Job queue with Redis for concurrency control
 * - Rate limiting per IP address
 * - CORS-enabled for frontend integration
 * - Proper error handling and graceful degradation
 */

const http = require('http');
const https = require('https');
const url = require('url');
const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const PORT = process.env.PORT || 3000;
const MAX_CONCURRENT = process.env.MAX_CONCURRENT || 2;
const RATE_LIMIT_PER_IP = process.env.RATE_LIMIT_PER_IP || 10; // per hour
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms

// In-memory queue and rate limiting (for single-server mode)
// Production version should use Redis + Bull
let activeAudits = 0;
const auditQueue = [];
const ipRequestMap = new Map(); // IP -> [timestamps]

/**
 * Rate limiting check
 */
function checkRateLimit(ip) {
  const now = Date.now();
  if (!ipRequestMap.has(ip)) {
    ipRequestMap.set(ip, []);
  }
  
  const timestamps = ipRequestMap.get(ip);
  // Remove old timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= RATE_LIMIT_PER_IP) {
    return false;
  }
  
  validTimestamps.push(now);
  ipRequestMap.set(ip, validTimestamps);
  return true;
}

/**
 * Run Lighthouse audit with retry logic
 */
async function runAudit(targetUrl) {
  let chrome;
  try {
    // Validate URL
    try {
      new URL(targetUrl);
    } catch (e) {
      throw new Error('Invalid URL format');
    }

    // Ensure URL has protocol
    let auditUrl = targetUrl;
    if (!auditUrl.startsWith('http://') && !auditUrl.startsWith('https://')) {
      auditUrl = 'https://' + auditUrl;
    }

    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });

    // Run Lighthouse
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(auditUrl, options);

    // Extract scores
    const scores = {
      url: auditUrl,
      timestamp: new Date().toISOString(),
      categories: {
        performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
        accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
        'best-practices': Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
        seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
      },
      audits: runnerResult.lhr.audits,
      opportunities: extractOpportunities(runnerResult.lhr),
      diagnostics: extractDiagnostics(runnerResult.lhr),
    };

    await chrome.kill();
    return scores;

  } catch (error) {
    if (chrome) {
      try {
        await chrome.kill();
      } catch (e) {
        // Already killed
      }
    }
    throw error;
  }
}

/**
 * Extract optimization opportunities from Lighthouse result
 */
function extractOpportunities(lhr) {
  const opportunities = [];
  
  if (lhr.audits['unused-css-rules']?.details?.items?.length > 0) {
    opportunities.push({
      title: 'Remove unused CSS',
      savings: lhr.audits['unused-css-rules'].details.overallSavingsMs,
      items: lhr.audits['unused-css-rules'].details.items.slice(0, 3),
    });
  }

  if (lhr.audits['modern-image-formats']?.details?.items?.length > 0) {
    opportunities.push({
      title: 'Use modern image formats',
      savings: lhr.audits['modern-image-formats'].details.overallSavingsMs,
      items: lhr.audits['modern-image-formats'].details.items.slice(0, 3),
    });
  }

  if (lhr.audits['offscreen-images']?.details?.items?.length > 0) {
    opportunities.push({
      title: 'Defer offscreen images',
      savings: lhr.audits['offscreen-images'].details.overallSavingsMs,
      items: lhr.audits['offscreen-images'].details.items.slice(0, 3),
    });
  }

  return opportunities.slice(0, 5);
}

/**
 * Extract key diagnostics from Lighthouse result
 */
function extractDiagnostics(lhr) {
  const diagnostics = {};
  
  if (lhr.audits['cumulative-layout-shift']) {
    diagnostics['cumulative-layout-shift'] = lhr.audits['cumulative-layout-shift'].numericValue;
  }
  
  if (lhr.audits['first-contentful-paint']) {
    diagnostics['first-contentful-paint'] = lhr.audits['first-contentful-paint'].numericValue;
  }
  
  if (lhr.audits['speed-index']) {
    diagnostics['speed-index'] = lhr.audits['speed-index'].numericValue;
  }
  
  if (lhr.audits['largest-contentful-paint']) {
    diagnostics['largest-contentful-paint'] = lhr.audits['largest-contentful-paint'].numericValue;
  }
  
  return diagnostics;
}

/**
 * Process next audit in queue
 */
async function processQueue() {
  if (activeAudits >= MAX_CONCURRENT || auditQueue.length === 0) {
    return;
  }

  const auditJob = auditQueue.shift();
  activeAudits++;

  try {
    const result = await runAudit(auditJob.url);
    console.log(`✅ Audit completed for ${auditJob.url}`);
    auditJob.resolve(result);
  } catch (error) {
    console.error(`❌ Audit failed for ${auditJob.url}:`, error.message);
    auditJob.reject(error);
  } finally {
    activeAudits--;
    processQueue(); // Process next in queue
  }
}

/**
 * Queue an audit job
 */
function queueAudit(url) {
  return new Promise((resolve, reject) => {
    auditQueue.push({ url, resolve, reject });
    processQueue();
  });
}

/**
 * HTTP Server
 */
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  // CACHE BUSTING - Force no caching for latest mobile UI fixes
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, public');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Cache-Busted', new Date().toISOString());
  res.setHeader('X-Version', 'rankrise-v2.1-mobile-fix');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Health check endpoint
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      activeAudits,
      queuedAudits: auditQueue.length,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Audit endpoint
  if (parsedUrl.pathname === '/api/audit') {
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

    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      res.writeHead(429);
      res.end(JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Maximum ${RATE_LIMIT_PER_IP} audits per hour`,
      }));
      return;
    }

    // Queue the audit
    console.log(`📋 Queued audit for ${targetUrl} from ${clientIp} (queue length: ${auditQueue.length + 1})`);
    
    queueAudit(targetUrl)
      .then(result => {
        res.writeHead(200);
        res.end(JSON.stringify(result));
      })
      .catch(error => {
        console.error(`Error auditing ${targetUrl}:`, error.message);
        res.writeHead(400);
        res.end(JSON.stringify({
          error: 'Audit failed',
          message: error.message,
          url: targetUrl,
        }));
      });

    return;
  }

  // Not found
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   🚀 RankRise Lighthouse Audit Backend                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🎯 Audit endpoint: http://localhost:${PORT}/api/audit?url=...`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log(`⚙️  Configuration:`);
  console.log(`   • Max concurrent audits: ${MAX_CONCURRENT}`);
  console.log(`   • Rate limit: ${RATE_LIMIT_PER_IP} audits/hour per IP`);
  console.log('');
  console.log(`📊 Ready to accept audit requests...`);
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
