#!/bin/bash

# Pre-deployment validation script
# Run this before deploying to catch common issues

set -e

echo "🔍 Coffee Brewster - Pre-Deployment Check"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}✗ Node.js version must be 20 or higher. Current: $(node -v)${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
fi
echo ""

# Check if dependencies are installed
echo "📚 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${RED}✗ Dependencies not installed. Run: npm install${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi
echo ""

# Check environment files
echo "🔐 Checking environment configuration..."
if [ ! -f "apps/api/.env.example" ]; then
    echo -e "${RED}✗ Missing apps/api/.env.example${NC}"
    exit 1
else
    echo -e "${GREEN}✓ apps/api/.env.example exists${NC}"
fi

if [ ! -f "apps/web/.env.example" ]; then
    echo -e "${RED}✗ Missing apps/web/.env.example${NC}"
    exit 1
else
    echo -e "${GREEN}✓ apps/web/.env.example exists${NC}"
fi
echo ""

# Run type check
echo "🔤 Running TypeScript type check..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${RED}✗ Type check failed. Run: npm run typecheck${NC}"
    exit 1
fi
echo ""

# Run linter
echo "🧹 Running linter..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠ Linting warnings found. Run: npm run lint${NC}"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✓ All tests passed${NC}"
else
    echo -e "${RED}✗ Tests failed. Run: npm test${NC}"
    exit 1
fi
echo ""

# Check for common security issues
echo "🔒 Checking for security issues..."
SECURITY_ISSUES=0

# Check for hardcoded secrets
if grep -r "sk_live" apps/ --exclude-dir=node_modules > /dev/null 2>&1; then
    echo -e "${RED}✗ Found potential API keys in code${NC}"
    SECURITY_ISSUES=1
fi

# Check for .env files in git
if git ls-files | grep -E "\.env$" > /dev/null 2>&1; then
    echo -e "${RED}✗ .env file is tracked by git (should be in .gitignore)${NC}"
    SECURITY_ISSUES=1
fi

if [ $SECURITY_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ No obvious security issues found${NC}"
fi
echo ""

# Build check
echo "🏗️  Testing production build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Production build successful${NC}"
else
    echo -e "${RED}✗ Production build failed. Run: npm run build${NC}"
    exit 1
fi
echo ""

# Final summary
echo "=========================================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the deployment guide: DEPLOYMENT.md"
echo "2. Set up your hosting accounts (Supabase, Render, Vercel)"
echo "3. Follow the deployment checklist: DEPLOYMENT-CHECKLIST.md"
echo ""
echo "Happy deploying! ☕✨"
