/**
 * Quick test script to verify Lighthouse audit functionality
 */

const http = require('http');

// Test configuration
const TEST_PORT = 3000;
const TEST_URL = 'https://example.com';
const TEST_TIMEOUT = 60000; // 60 seconds

console.log('\n🧪 RankRise Lighthouse Backend Test\n');
console.log('Starting test server...');

// Import the server (we'll need to modify it slightly to export the server)
// For now, just make a request to a running server

function testAudit() {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${TEST_PORT}/api/audit?url=${encodeURIComponent(TEST_URL)}`;
    
    console.log(`\n📍 Testing endpoint: ${url}`);
    console.log('⏱️  This will take 20-30 seconds...\n');

    const startTime = Date.now();
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        
        try {
          const result = JSON.parse(data);
          
          console.log(`✅ Audit completed in ${elapsed} seconds\n`);
          console.log('📊 Results:');
          console.log(`  • URL: ${result.url}`);
          console.log(`  • Performance: ${result.categories.performance}/100`);
          console.log(`  • SEO: ${result.categories.seo}/100`);
          console.log(`  • Accessibility: ${result.categories.accessibility}/100`);
          console.log(`  • Best Practices: ${result.categories['best-practices']}/100`);
          console.log(`\n✅ Backend is working correctly!\n`);
          
          resolve(true);
        } catch (e) {
          console.error(`❌ Failed to parse response: ${e.message}`);
          console.error(`Response: ${data.substring(0, 500)}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Request failed: ${err.message}`);
      console.error('\nMake sure the server is running:');
      console.error('  npm start\n');
      reject(err);
    });
    
    setTimeout(() => {
      reject(new Error('Test timeout (60 seconds)'));
    }, TEST_TIMEOUT);
  });
}

// Run test
testAudit()
  .then(() => {
    console.log('🎉 All tests passed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n❌ Test failed: ${err.message}`);
    process.exit(1);
  });
