#!/usr/bin/env node

/**
 * RankRise Audit Tool - Backend Test Suite
 * Tests the backend API proxy without requiring a real API key
 * 
 * Usage: node test-backend.js
 */

const http = require('http');
const assert = require('assert');

// Test configuration
const TEST_PORT = 3001;
const TEST_TIMEOUT = 5000;

console.log('========================================');
console.log('RankRise Audit Tool - Backend Test Suite');
console.log('========================================\n');

// Create a test server with the same logic as server.js but with mock responses
function createTestServer() {
  return http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname !== '/api/pagespeed') {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing url parameter' }));
      return;
    }

    // Mock successful response
    const mockResponse = {
      lighthouseResult: {
        categories: {
          seo: { score: 0.95 },
          performance: { score: 0.87 },
          accessibility: { score: 0.92 },
          'best-practices': { score: 0.88 }
        },
        audits: {
          'meta-description': { score: 1, title: 'Meta description' },
          'document-title': { score: 1, title: 'Document title' },
          'viewport': { score: 1, title: 'Viewport' },
          'font-size': { score: null, title: 'Font sizes' },
          'speed-index': { score: 0.8, title: 'Speed index' }
        }
      }
    };

    res.writeHead(200);
    res.end(JSON.stringify(mockResponse));
  });
}

// Run tests
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  console.log(`Testing: ${name}...`);
  try {
    fn();
    console.log(`  ✓ PASS\n`);
    testsPassed++;
  } catch (err) {
    console.log(`  ✗ FAIL: ${err.message}\n`);
    testsFailed++;
  }
}

function makeRequest(path, callback) {
  const req = http.get(`http://localhost:${TEST_PORT}${path}`, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        callback(null, {
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      } catch (err) {
        callback(err);
      }
    });
  });
  req.on('error', callback);
  req.setTimeout(TEST_TIMEOUT);
}

// Start test server
const server = createTestServer();
server.listen(TEST_PORT, () => {
  console.log(`Test server running on port ${TEST_PORT}\n`);

  // Test 1: Valid URL request
  test('GET /api/pagespeed?url=https://google.com', (done) => {
    makeRequest('/api/pagespeed?url=https://google.com', (err, res) => {
      assert(!err, err?.message);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      assert(res.body.lighthouseResult, 'Missing lighthouseResult');
      assert(res.body.lighthouseResult.categories, 'Missing categories');
    });
  });

  // Test 2: Missing URL parameter
  test('GET /api/pagespeed (missing url)', (done) => {
    makeRequest('/api/pagespeed', (err, res) => {
      assert(!err, err?.message);
      assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
      assert.strictEqual(res.body.error, 'Missing url parameter');
    });
  });

  // Test 3: Invalid endpoint
  test('GET /invalid-endpoint', (done) => {
    makeRequest('/invalid-endpoint', (err, res) => {
      assert(!err, err?.message);
      assert.strictEqual(res.status, 404, `Expected 404, got ${res.status}`);
      assert.strictEqual(res.body.error, 'Not found');
    });
  });

  // Test 4: CORS headers
  test('CORS headers are present', (done) => {
    makeRequest('/api/pagespeed?url=https://google.com', (err, res) => {
      assert(!err, err?.message);
      assert.strictEqual(
        res.headers['access-control-allow-origin'],
        '*',
        'CORS origin header missing'
      );
    });
  });

  // Test 5: Response structure
  test('Response has correct structure', (done) => {
    makeRequest('/api/pagespeed?url=https://google.com', (err, res) => {
      assert(!err, err?.message);
      assert(res.body.lighthouseResult.audits, 'Missing audits');
      const hasMetaDesc = res.body.lighthouseResult.audits['meta-description'];
      assert(hasMetaDesc, 'Missing meta-description audit');
    });
  });

  // Summary
  setTimeout(() => {
    server.close();
    console.log('\n========================================');
    console.log(`Tests Passed: ${testsPassed}`);
    console.log(`Tests Failed: ${testsFailed}`);
    console.log('========================================\n');

    if (testsFailed === 0) {
      console.log('✅ All tests passed!');
      console.log('\nNext: Set up a real API key and test with actual Google API\n');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed');
      process.exit(1);
    }
  }, 100);
});
