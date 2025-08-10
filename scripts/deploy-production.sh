#!/bin/bash

# Socket Painting Canvas - Production Deployment Script
# This script handles the complete production deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="socket-painting-app"
NODE_VERSION="18"
PM2_CONFIG="ecosystem.config.js"
ENV_FILE="config.prod.env"
LOG_DIR="./logs"
BUILD_DIR="./dist"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        "HEADER")
            echo -e "${PURPLE}🚀 $message${NC}"
            ;;
        *)
            echo -e "${CYAN}$message${NC}"
            ;;
    esac
}

# Function to check prerequisites
check_prerequisites() {
    print_status "HEADER" "Checking Prerequisites"
    echo "================================"
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_status "ERROR" "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)
    
    if [ "$major_version" -lt "$NODE_VERSION" ]; then
        print_status "ERROR" "Node.js version $node_version is too old. Required: v$NODE_VERSION+"
        exit 1
    fi
    
    print_status "SUCCESS" "Node.js version: $node_version"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_status "ERROR" "npm is not installed"
        exit 1
    fi
    
    local npm_version=$(npm --version)
    print_status "SUCCESS" "npm version: $npm_version"
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        print_status "WARNING" "PM2 is not installed globally"
        print_status "INFO" "Installing PM2 globally..."
        npm install -g pm2
    fi
    
    local pm2_version=$(pm2 --version)
    print_status "SUCCESS" "PM2 version: $pm2_version"
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        print_status "ERROR" "Production environment file not found: $ENV_FILE"
        print_status "INFO" "Please copy config.prod.env.example to config.prod.env and configure it"
        exit 1
    fi
    
    print_status "SUCCESS" "Environment file found: $ENV_FILE"
    
    echo ""
}

# Function to stop existing processes
stop_existing_processes() {
    print_status "HEADER" "Stopping Existing Processes"
    echo "=================================="
    
    # Check if PM2 is running any processes
    if pm2 list | grep -q "$APP_NAME"; then
        print_status "INFO" "Stopping existing $APP_NAME process..."
        pm2 stop "$APP_NAME" 2>/dev/null || true
        pm2 delete "$APP_NAME" 2>/dev/null || true
        print_status "SUCCESS" "Existing processes stopped and removed"
    else
        print_status "INFO" "No existing processes found"
    fi
    
    echo ""
}

# Function to clean up old builds
cleanup_old_builds() {
    print_status "HEADER" "Cleaning Up Old Builds"
    echo "================================"
    
    if [ -d "$BUILD_DIR" ]; then
        print_status "INFO" "Removing old build directory..."
        rm -rf "$BUILD_DIR"
        print_status "SUCCESS" "Old build directory removed"
    fi
    
    if [ -d "$LOG_DIR" ]; then
        print_status "INFO" "Cleaning old log files..."
        find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        print_status "SUCCESS" "Old log files cleaned"
    fi
    
    echo ""
}

# Function to install dependencies
install_dependencies() {
    print_status "HEADER" "Installing Dependencies"
    echo "================================"
    
    # Install root dependencies (including build tools)
    print_status "INFO" "Installing root dependencies..."
    npm ci --include=dev
    
    if [ $? -eq 0 ]; then
        print_status "SUCCESS" "Root dependencies installed"
    else
        print_status "ERROR" "Failed to install root dependencies"
        exit 1
    fi
    
    # Install server dependencies
    print_status "INFO" "Installing server dependencies..."
    cd server && npm ci --production && cd ..
    
    if [ $? -eq 0 ]; then
        print_status "SUCCESS" "Server dependencies installed"
    else
        print_status "ERROR" "Failed to install server dependencies"
        exit 1
    fi
    
    echo ""
}

# Function to build the application
build_application() {
    print_status "HEADER" "Building Application"
    echo "================================"
    
    print_status "INFO" "Building React application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "SUCCESS" "Application built successfully"
        
        # Verify build output
        if [ -d "$BUILD_DIR" ] && [ -f "$BUILD_DIR/index.html" ]; then
            local build_size=$(du -sh "$BUILD_DIR" | cut -f1)
            print_status "SUCCESS" "Build output verified: $build_size"
        else
            print_status "ERROR" "Build output verification failed"
            exit 1
        fi
    else
        print_status "ERROR" "Build failed"
        exit 1
    fi
    
    echo ""
}

# Function to start the application
start_application() {
    print_status "HEADER" "Starting Application"
    echo "================================"
    
    print_status "INFO" "Starting application with PM2..."
    pm2 start "$PM2_CONFIG" --env production
    
    if [ $? -eq 0 ]; then
        print_status "SUCCESS" "Application started with PM2"
    else
        print_status "ERROR" "Failed to start application"
        exit 1
    fi
    
    # Wait for application to be ready
    print_status "INFO" "Waiting for application to be ready..."
    sleep 5
    
    # Check if application is running
    if pm2 list | grep -q "$APP_NAME.*online"; then
        print_status "SUCCESS" "Application is running and online"
    else
        print_status "ERROR" "Application failed to start properly"
        pm2 logs "$APP_NAME" --lines 20
        exit 1
    fi
    
    # Save PM2 configuration
    print_status "INFO" "Saving PM2 configuration..."
    pm2 save
    
    echo ""
}

# Function to verify deployment
verify_deployment() {
    print_status "HEADER" "Verifying Deployment"
    echo "================================"
    
    # Check PM2 status
    print_status "INFO" "PM2 Status:"
    pm2 status --no-daemon
    
    # Check application health
print_status "INFO" "Checking application health..."
if curl -s "http://localhost:3000/api/health" >/dev/null 2>&1; then
        print_status "SUCCESS" "Health endpoint is responding"
    else
        print_status "WARNING" "Health endpoint is not responding yet"
    fi
    
    # Check API endpoints
    print_status "INFO" "Checking API endpoints..."
    if curl -s "http://localhost:3000/api" >/dev/null 2>&1; then
        print_status "SUCCESS" "API endpoints are responding"
    else
        print_status "WARNING" "API endpoints are not responding yet"
    fi
    
    # Check main application
    print_status "INFO" "Checking main application..."
    if curl -s "http://localhost:3000" >/dev/null 2>&1; then
        print_status "SUCCESS" "Main application is responding"
    else
        print_status "WARNING" "Main application is not responding yet"
    fi
    
    echo ""
}

# Function to show deployment summary
show_deployment_summary() {
    print_status "HEADER" "Deployment Summary"
    echo "========================="
    
    echo "✅ Application: $APP_NAME"
    echo "✅ Environment: Production"
    echo "✅ Port: 3000"
    echo "✅ PM2 Process: Running"
    echo "✅ Build: Complete"
    echo "✅ Dependencies: Installed"
    
    echo ""
    echo "🔗 Local URLs:"
    echo "   - Application: http://localhost:3000"
    echo "   - Health Check: http://localhost:3000/api/health"
    echo "   - API: http://localhost:3000/api"
    
    echo ""
    echo "📊 Monitoring Commands:"
    echo "   - PM2 Status: pm2 status"
    echo "   - PM2 Logs: pm2 logs $APP_NAME"
    echo "   - PM2 Monitor: pm2 monit"
    echo "   - Health Check: ./scripts/monitor.sh --health"
    echo "   - Full Monitoring: ./scripts/monitor.sh"
    
    echo ""
    echo "🔄 Management Commands:"
    echo "   - Restart: pm2 restart $APP_NAME"
    echo "   - Stop: pm2 stop $APP_NAME"
    echo "   - Reload: pm2 reload $PM2_CONFIG --env production"
    
    echo ""
}

# Function to show help
show_help() {
    echo "Socket Painting Canvas - Production Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --help              Show this help message"
    echo "  --skip-deps         Skip dependency installation"
    echo "  --skip-build        Skip application build"
    echo "  --skip-start        Skip application start"
    echo "  --verify-only       Only verify existing deployment"
    echo ""
    echo "Examples:"
    echo "  $0                  # Full deployment"
    echo "  $0 --skip-deps      # Skip dependency installation"
    echo "  $0 --verify-only    # Only verify deployment"
}

# Parse command line arguments
SKIP_DEPS=false
SKIP_BUILD=false
SKIP_START=false
VERIFY_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-start)
            SKIP_START=true
            shift
            ;;
        --verify-only)
            VERIFY_ONLY=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main deployment process
main() {
    print_status "HEADER" "Starting Production Deployment"
    echo "========================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    if [ "$VERIFY_ONLY" = true ]; then
        verify_deployment
        show_deployment_summary
        exit 0
    fi
    
    # Stop existing processes
    stop_existing_processes
    
    # Clean up old builds
    cleanup_old_builds
    
    # Install dependencies
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
    else
        print_status "INFO" "Skipping dependency installation"
    fi
    
    # Build application
    if [ "$SKIP_BUILD" = false ]; then
        build_application
    else
        print_status "INFO" "Skipping application build"
    fi
    
    # Start application
    if [ "$SKIP_START" = false ]; then
        start_application
    else
        print_status "INFO" "Skipping application start"
    fi
    
    # Verify deployment
    verify_deployment
    
    # Show summary
    show_deployment_summary
    
    print_status "SUCCESS" "Production deployment completed successfully!"
}

# Run main function
main "$@"
