#!/bin/bash

###############################################################################
# RankRise Lighthouse Audit Tool - Render.com Deployment Script
# 
# This script automates deployment to Render.com
# Prerequisites: Git, Node.js, GitHub repo access
#
# Usage: ./deploy-to-render.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Anuar-boop/teamrankrise.git"
BACKEND_SERVICE_NAME="rankrise-audit-backend"
FRONTEND_SERVICE_NAME="rankrise-website"
DOMAIN="teamrankrise.com"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 RankRise Lighthouse Deployment to Render.com     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Step 1: Verify Prerequisites
###############################################################################

echo -e "${YELLOW}Step 1: Verifying prerequisites...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git is installed${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository. Please run from the teamrankrise directory.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ In git repository${NC}"

# Check git status
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Committing...${NC}"
    git add -A
    git commit -m "Deploy to Render: $(date '+%Y-%m-%d %H:%M:%S')"
fi
echo -e "${GREEN}✅ Git status clean${NC}"

echo ""

###############################################################################
# Step 2: Push to GitHub
###############################################################################

echo -e "${YELLOW}Step 2: Pushing code to GitHub...${NC}"

git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub. Check your git configuration.${NC}"
    exit 1
fi

echo ""

###############################################################################
# Step 3: Prepare Render Configuration
###############################################################################

echo -e "${YELLOW}Step 3: Checking Render configuration files...${NC}"

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${YELLOW}⚠️  render.yaml not found. Creating...${NC}"
    cat > render.yaml << 'EOF'
services:
  - type: web
    name: rankrise-audit-backend
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: MAX_CONCURRENT
        value: "2"
      - key: RATE_LIMIT_PER_IP
        value: "10"
EOF
    git add render.yaml
    git commit -m "Add Render configuration"
    git push origin main
fi
echo -e "${GREEN}✅ Render configuration ready${NC}"

echo ""

###############################################################################
# Step 4: Display Render Deployment Instructions
###############################################################################

echo -e "${YELLOW}Step 4: Deployment Instructions${NC}"
echo ""
echo -e "${BLUE}Your code is ready for Render.com deployment!${NC}"
echo ""
echo -e "${GREEN}Follow these steps to deploy:${NC}"
echo ""
echo -e "${BLUE}1. Go to ${NC}https://render.com/register"
echo -e "   - Sign up with GitHub (recommended)"
echo -e "   - Authorize Render to access your GitHub account"
echo ""
echo -e "${BLUE}2. Create Backend Service:${NC}"
echo -e "   - Click 'New +' → 'Web Service'"
echo -e "   - Select 'teamrankrise' repository"
echo -e "   - Name: rankrise-audit-backend"
echo -e "   - Runtime: Node"
echo -e "   - Build: npm install"
echo -e "   - Start: npm start"
echo -e "   - Plan: Free (testing) or Starter (production)"
echo ""
echo -e "${BLUE}3. Create Frontend Service:${NC}"
echo -e "   - Click 'New +' → 'Static Site'"
echo -e "   - Select 'teamrankrise' repository"
echo -e "   - Name: rankrise-website"
echo -e "   - Publish Directory: ./"
echo ""
echo -e "${BLUE}4. Update DNS:${NC}"
echo -e "   - Get Render CNAME from static site settings"
echo -e "   - Update teamrankrise.com DNS records"
echo -e "   - Wait for DNS propagation (5-48 hours)"
echo ""
echo -e "${BLUE}5. Test:${NC}"
echo -e "   - Visit https://teamrankrise.com/free-audit.html"
echo -e "   - Enter a URL and run an audit"
echo -e "   - Verify results display correctly"
echo ""

###############################################################################
# Step 5: Provide Helpful Commands
###############################################################################

echo -e "${YELLOW}Step 5: Helpful Commands${NC}"
echo ""
echo -e "${BLUE}Check backend health:${NC}"
echo -e "  curl https://rankrise-audit-backend.onrender.com/health"
echo ""
echo -e "${BLUE}Test audit endpoint:${NC}"
echo -e "  curl 'https://rankrise-audit-backend.onrender.com/api/audit?url=https://example.com'"
echo ""
echo -e "${BLUE}View logs:${NC}"
echo -e "  Open Render dashboard → rankrise-audit-backend → Logs"
echo ""
echo -e "${BLUE}Scale resources:${NC}"
echo -e "  Open Render dashboard → rankrise-audit-backend → Settings"
echo ""

###############################################################################
# Step 6: Documentation
###############################################################################

echo -e "${YELLOW}Step 6: Documentation${NC}"
echo ""
echo -e "${BLUE}For detailed information, see:${NC}"
echo -e "  - RENDER_DEPLOYMENT.md (this file)"
echo -e "  - IMPLEMENTATION_GUIDE.md (architecture details)"
echo -e "  - DEPLOYMENT_STATUS.md (current status)"
echo ""

###############################################################################
# Step 7: Final Checklist
###############################################################################

echo -e "${YELLOW}Step 7: Pre-Deployment Checklist${NC}"
echo ""
echo -e "${BLUE}Verify the following before deploying:${NC}"
echo -e "  [ ] Code committed to GitHub"
echo -e "  [ ] render.yaml present"
echo -e "  [ ] package.json has correct dependencies"
echo -e "  [ ] server-lighthouse.js is the start file"
echo -e "  [ ] free-audit.html points to Render backend"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Ready for Render Deployment!                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next: Go to https://render.com and create services using GitHub${NC}"
echo -e "${YELLOW}      follow the instructions in Step 2 above.${NC}"
echo ""
