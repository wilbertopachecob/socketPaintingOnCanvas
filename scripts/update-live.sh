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

print_info "Starting deployment update process..."

# 1. Build the React application
echo "🔨 Building React application..."
npm run build
print_status "React build completed"

# 2. Commit and push changes to repository (if git repo exists)
if [ -d ".git" ]; then
    echo "📤 Committing and pushing changes to repository..."
    
    # Check if there are changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        git add .
        git commit -m "Deploy: Update live deployment ($(date))"
        
        # Push to remote repository
        git push origin master
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
echo "   cd /var/www/socket-painting-app  # or wherever your app is located"
echo ""
echo "3. Pull the latest changes:"
echo "   git pull origin master"
echo ""
echo "4. Install dependencies and build:"
echo "   npm ci --production"
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
        # ssh your-server "cd /var/www/socket-painting-app && git pull origin master && npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production"
        
        print_warning "Direct deployment requires SSH configuration. Please manually deploy using the steps above."
    fi
fi

echo ""
print_status "🎉 Local preparation completed!"
print_info "Your React app is built and ready for deployment"
print_info "After deploying to server, your app will be live at: https://paint.wilbertopachecob.dev/"
