#!/bin/bash

# RankRise SEO Audit Tool - Setup Verification Script
# This script verifies that everything is configured correctly

echo "=========================================="
echo "RankRise Audit Tool - Setup Verification"
echo "=========================================="
echo ""

# Check 1: Node.js installed
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "  ✗ Node.js not installed. Install from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  ✓ Node.js $NODE_VERSION installed"
echo ""

# Check 2: .env file exists
echo "✓ Checking .env file..."
if [ ! -f ".env" ]; then
    echo "  ✗ .env file not found"
    echo "  → Run: cp .env.example .env"
    echo "  → Then edit .env and add your GOOGLE_API_KEY"
    exit 1
fi
echo "  ✓ .env file found"
echo ""

# Check 3: API key configured
echo "✓ Checking GOOGLE_API_KEY..."
source .env 2>/dev/null || true

if [ -z "$GOOGLE_API_KEY" ] || [ "$GOOGLE_API_KEY" = "your_api_key_here" ]; then
    echo "  ✗ GOOGLE_API_KEY not configured"
    echo ""
    echo "  To get your API key:"
    echo "  1. Go to https://console.cloud.google.com/"
    echo "  2. Create a new project or select existing"
    echo "  3. Enable 'PageSpeed Insights API'"
    echo "  4. Go to Credentials > Create Credentials > API Key"
    echo "  5. Edit .env and paste your key"
    echo ""
    echo "  Example:"
    echo "    GOOGLE_API_KEY=AIzaSy..."
    echo ""
    exit 1
fi
echo "  ✓ GOOGLE_API_KEY configured: ${GOOGLE_API_KEY:0:10}..."
echo ""

# Check 4: server.js exists
echo "✓ Checking server.js..."
if [ ! -f "server.js" ]; then
    echo "  ✗ server.js not found"
    exit 1
fi
echo "  ✓ server.js found"
echo ""

# Check 5: free-audit.html updated
echo "✓ Checking free-audit.html..."
if grep -q "/api/pagespeed" free-audit.html; then
    echo "  ✓ free-audit.html correctly configured to call /api/pagespeed"
else
    echo "  ✗ free-audit.html not updated"
    echo "  → Make sure API endpoint is set to /api/pagespeed"
    exit 1
fi
echo ""

# All checks passed
echo "=========================================="
echo "✅ All checks passed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   $ node server.js"
echo ""
echo "2. In another terminal, serve the static files:"
echo "   $ python3 -m http.server 8000"
echo ""
echo "3. Open in browser:"
echo "   http://localhost:8000/free-audit.html"
echo ""
echo "4. Test with a URL like:"
echo "   https://google.com"
echo ""
echo "=========================================="
