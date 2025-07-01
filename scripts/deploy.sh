#!/bin/bash

# LLM Checker Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

echo "🚀 LLM Checker Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Commit them first? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Enter commit message:"
        read -r commit_message
        git add .
        git commit -m "$commit_message"
        print_status "Changes committed"
    else
        print_error "Deployment cancelled. Please commit your changes first."
        exit 1
    fi
fi

# Run tests before deployment
print_status "Running tests..."
if npm test -- --passWithNoTests; then
    print_status "Tests passed"
else
    print_error "Tests failed. Fix them before deploying."
    exit 1
fi

# Build the project
print_status "Building project..."
if npm run build; then
    print_status "Build successful"
else
    print_error "Build failed. Fix errors before deploying."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm i -g vercel
    print_status "Vercel CLI installed"
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin main || {
    print_warning "Failed to push to GitHub. Repository might not be set up."
    echo "Would you like to set up GitHub repository? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Enter your GitHub repository URL (e.g., https://github.com/username/llm-checker.git):"
        read -r repo_url
        git remote add origin "$repo_url"
        git push -u origin main
        print_status "GitHub repository configured and pushed"
    fi
}

# Deploy to Vercel
print_status "Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "1) Preview deployment (recommended for first time)"
echo "2) Production deployment"
echo ""
read -r -p "Enter choice (1 or 2): " deployment_choice

if [ "$deployment_choice" = "2" ]; then
    vercel --prod
else
    vercel
fi

echo ""
echo "================================"
print_status "Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel Dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_GA_ID (optional)"
echo ""
echo "2. Update your production URLs in Vercel settings"
echo ""
echo "3. Configure custom domain (optional):"
echo "   - Go to Vercel Dashboard → Settings → Domains"
echo ""
echo "4. Set up GitHub integration for auto-deployments:"
echo "   - Go to Vercel Dashboard → Settings → Git"
echo ""
echo "🎉 Happy deploying!"