#!/bin/bash

# Socket Painting Canvas - Production Deployment Script
echo "🚀 Deploying Socket Painting Canvas to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error handling
set -e

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root is not recommended for deployment"
fi

# Load production environment variables
if [ -f "config.prod.env" ]; then
    set -a
    source config.prod.env
    set +a
    print_status "Loaded production environment variables"
else
    print_error "config.prod.env not found. Please create it first."
    exit 1
fi

# Validate SESSION_SECRET is set and secure
# Extract placeholder from config.prod.env.example to avoid hardcoded values
SESSION_SECRET_PLACEHOLDER=""
if [ -f "config.prod.env.example" ]; then
    SESSION_SECRET_PLACEHOLDER=$(grep -E '^SESSION_SECRET=' config.prod.env.example | sed -E 's/^SESSION_SECRET=//' | tr -d '"'"'"'')
fi

if [ -z "$SESSION_SECRET" ] || [ "$SESSION_SECRET" = "$SESSION_SECRET_PLACEHOLDER" ]; then
    print_error "SESSION_SECRET must be set to a secure value. Generate one with: openssl rand -base64 32"
    print_error "Set it as an environment variable: export SESSION_SECRET=your_secure_secret"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Install it with: npm install -g pm2"
    exit 1
fi

# Create logs directory
mkdir -p logs
print_status "Created logs directory"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production
print_status "Dependencies installed"

# Build the application
echo "🔨 Building application..."
npm run build
print_status "Application built successfully"

# Stop existing PM2 process if running
if pm2 describe socket-painting-app > /dev/null 2>&1; then
    echo "🛑 Stopping existing PM2 process..."
    pm2 stop socket-painting-app
    pm2 delete socket-painting-app
    print_status "Existing process stopped"
fi

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
print_status "Application started with PM2"

# Save PM2 configuration
pm2 save
print_status "PM2 configuration saved"

# Setup PM2 startup script (run only once per server)
PM2_STARTUP_STATUS=$(pm2 startup | grep -i "command" || true)
if [ -n "$PM2_STARTUP_STATUS" ]; then
    echo "🔄 PM2 startup is not fully configured."
    read -p "This step requires running a privileged command to configure PM2 startup. Do you want to proceed? [y/N] " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        sudo env PATH=$PATH:$(dirname $(which node)) $(which pm2) startup systemd -u $USER --hp $HOME
        print_warning "PM2 startup script configured. Run 'pm2 save' to save current process list"
    else
        print_warning "Skipped PM2 startup script configuration. You may need to run it manually."
    fi
else
    print_status "PM2 startup script is already configured"
fi

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📍 Application Status:"
pm2 status
echo ""
echo "📝 Useful PM2 Commands:"
echo "   pm2 logs socket-painting-app    # View logs"
echo "   pm2 monit                       # Monitor in real-time"
echo "   pm2 restart socket-painting-app # Restart app"
echo "   pm2 stop socket-painting-app    # Stop app"
echo ""
print_status "✨ Your Socket Painting Canvas is now live!"
