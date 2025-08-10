#!/bin/bash

# Socket Painting Canvas - Update Live Deployment Script
echo "🔄 Updating Live Deployment at paint.wilbertopachecob.dev..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Error handling
set -e

# Configuration
APP_DIR_ON_SERVER=${APP_DIR_ON_SERVER:-"/var/www/socket-painting-app"}

print_info "Starting deployment update process..."

# 1. Install dependencies and build the React application
echo "📦 Installing dependencies..."
npm install
print_status "Dependencies installed"

echo "🔨 Building React application..."
npm run build
print_status "React build completed"

# Get the default branch name
if git show-ref --verify --quiet refs/heads/main; then
    DEFAULT_BRANCH="main"
elif git show-ref --verify --quiet refs/heads/master; then
    DEFAULT_BRANCH="master"
else
    # Try to detect from remote HEAD, fallback to master
    DEFAULT_BRANCH=$(git branch -r --points-at origin/HEAD | sed -n 's@origin/@@p' | head -n 1)
    if [ -z "$DEFAULT_BRANCH" ]; then
        DEFAULT_BRANCH="master"
    fi
fi

# 2. Commit and push changes to repository (if git repo exists)
if [ -d ".git" ]; then
    echo "📤 Committing and pushing changes to repository..."
    
    # Check if there are changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        git add .
        git commit -m "Deploy: Update live deployment ($(date))"
        
        # Push to remote repository
        git push origin "$DEFAULT_BRANCH"
        print_status "Changes committed and pushed to repository"
    else
        print_info "No changes to commit"
    fi
else
    print_warning "Not a git repository - skipping version control step"
fi

# 3. Instructions for server deployment
echo ""
print_info "🚀 Next steps for server deployment:"
echo ""
echo "1. SSH into your server:"
echo "   ssh your-username@your-server-ip"
echo ""
echo "2. Navigate to your application directory:"
echo "   cd $APP_DIR_ON_SERVER  # (configured app directory)"
echo ""
echo "3. Pull the latest changes:"
echo "   git pull origin $DEFAULT_BRANCH  # (current branch: '$DEFAULT_BRANCH')"
echo ""
echo "4. Install dependencies and build:"
echo "   npm ci  # Install root dependencies (including build tools)"
echo "   cd server && npm ci --production && cd ..  # Install server dependencies"
echo "   npm run build"
echo ""
echo "5. Update PM2 deployment:"
echo "   pm2 reload ecosystem.config.js --env production"
echo "   # OR if not using PM2 yet:"
echo "   pm2 start ecosystem.config.js --env production"
echo ""
echo "6. Save PM2 configuration:"
echo "   pm2 save"
echo ""

# 4. Alternative: If you have SSH access configured, deploy directly
if [ -f "$HOME/.ssh/config" ] && grep -q "paint.wilbertopachecob.dev\|your-server" "$HOME/.ssh/config"; then
    echo ""
    read -p "Do you want to deploy directly to the server? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deploying directly to server..."
        
        # This would require SSH key setup and proper server configuration
        # ssh your-server "cd \"$APP_DIR_ON_SERVER\" && git pull origin \"$DEFAULT_BRANCH\" && npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production"
        
        print_warning "Direct deployment requires SSH configuration. Please manually deploy using the steps above."
    fi
fi

echo ""
print_status "🎉 Local preparation completed!"
print_info "Your React app is built and ready for deployment"
print_info "After deploying to server, your app will be live at: https://paint.wilbertopachecob.dev/"
