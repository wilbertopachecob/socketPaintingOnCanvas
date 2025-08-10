#!/bin/bash

# Socket Painting Canvas - Monitoring Script
# This script provides comprehensive monitoring of the application

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
LOG_DIR="./logs"
HEALTH_ENDPOINT="http://localhost:3000/health"
DETAILED_HEALTH_ENDPOINT="http://localhost:3000/health/detailed"
API_ENDPOINT="http://localhost:3000/api"
USERS_ENDPOINT="http://localhost:3000/api/users"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "OK"|"SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING"|"DEGRADED")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR"|"FAILED")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        "HEADER")
            echo -e "${PURPLE}📊 $message${NC}"
            ;;
        *)
            echo -e "${CYAN}$message${NC}"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check PM2 status
check_pm2_status() {
    print_status "HEADER" "PM2 Process Status"
    echo "=================================="
    
    if ! command_exists pm2; then
        print_status "ERROR" "PM2 is not installed. Install with: npm install -g pm2"
        return 1
    fi
    
    local pm2_status=$(pm2 status --no-daemon 2>/dev/null || echo "No processes")
    
    if echo "$pm2_status" | grep -q "$APP_NAME.*online"; then
        print_status "SUCCESS" "Application is running and online"
    elif echo "$pm2_status" | grep -q "$APP_NAME.*errored"; then
        print_status "ERROR" "Application has errors and needs attention"
    elif echo "$pm2_status" | grep -q "$APP_NAME.*stopped"; then
        print_status "WARNING" "Application is stopped"
    else
        print_status "WARNING" "Application process not found"
    fi
    
    echo ""
    pm2 status --no-daemon
    echo ""
}

# Function to check application health
check_app_health() {
    print_status "HEADER" "Application Health Check"
    echo "=================================="
    
    # Check basic health endpoint
    if curl -s "$HEALTH_ENDPOINT" >/dev/null 2>&1; then
        print_status "SUCCESS" "Health endpoint is responding"
        
        # Get detailed health information
        local health_data=$(curl -s "$HEALTH_ENDPOINT")
        local status=$(echo "$health_data" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        if [ "$status" = "OK" ]; then
            print_status "SUCCESS" "Application health status: $status"
        else
            print_status "WARNING" "Application health status: $status"
        fi
        
        # Display key metrics
        echo ""
        echo "Key Metrics:"
        echo "  - Process Uptime: $(echo "$health_data" | grep -o '"uptime":"[^"]*"' | cut -d'"' -f4)"
        echo "  - Memory Usage: $(echo "$health_data" | grep -o '"heapUsed":"[^"]*"' | cut -d'"' -f4)"
        echo "  - Platform: $(echo "$health_data" | grep -o '"platform":"[^"]*"' | cut -d'"' -f4)"
        
    else
        print_status "ERROR" "Health endpoint is not responding"
        return 1
    fi
    
    echo ""
}

# Function to check API endpoints
check_api_endpoints() {
    print_status "HEADER" "API Endpoints Status"
    echo "================================"
    
    # Check API root
    if curl -s "$API_ENDPOINT" >/dev/null 2>&1; then
        print_status "SUCCESS" "API root endpoint is responding"
    else
        print_status "ERROR" "API root endpoint is not responding"
    fi
    
    # Check users endpoint
    if curl -s "$USERS_ENDPOINT" >/dev/null 2>&1; then
        print_status "SUCCESS" "Users endpoint is responding"
        
        # Get user count
        local user_data=$(curl -s "$USERS_ENDPOINT")
        local user_count=$(echo "$user_data" | grep -o '"currentUsers":[0-9]*' | cut -d':' -f2)
        echo "  - Current Users: $user_count"
    else
        print_status "ERROR" "Users endpoint is not responding"
    fi
    
    echo ""
}

# Function to check system resources
check_system_resources() {
    print_status "HEADER" "System Resources"
    echo "========================="
    
    # CPU usage
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    if [ -n "$cpu_usage" ]; then
        if (( $(echo "$cpu_usage < 80" | bc -l) )); then
            print_status "SUCCESS" "CPU Usage: ${cpu_usage}%"
        else
            print_status "WARNING" "CPU Usage: ${cpu_usage}% (High)"
        fi
    fi
    
    # Memory usage
    local memory_info=$(vm_stat | grep "Pages free:" | awk '{print $3}' | sed 's/\.//')
    local total_memory=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024}')
    local free_memory=$(echo "scale=2; $memory_info * 4096 / 1024 / 1024 / 1024" | bc)
    local used_memory=$(echo "scale=2; $total_memory - $free_memory" | bc)
    local memory_percent=$(echo "scale=2; ($used_memory / $total_memory) * 100" | bc)
    
    if (( $(echo "$memory_percent < 80" | bc -l) )); then
        print_status "SUCCESS" "Memory Usage: ${memory_percent}% (${used_memory}GB / ${total_memory}GB)"
    else
        print_status "WARNING" "Memory Usage: ${memory_percent}% (${used_memory}GB / ${total_memory}GB) (High)"
    fi
    
    # Disk usage
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 80 ]; then
        print_status "SUCCESS" "Disk Usage: ${disk_usage}%"
    else
        print_status "WARNING" "Disk Usage: ${disk_usage}% (High)"
    fi
    
    echo ""
}

# Function to check logs
check_logs() {
    print_status "HEADER" "Recent Logs"
    echo "=================="
    
    if [ -d "$LOG_DIR" ]; then
        # Check error logs
        if [ -f "$LOG_DIR/error.log" ]; then
            local error_count=$(tail -100 "$LOG_DIR/error.log" | grep -c "ERROR\|FATAL" || echo "0")
            if [ "$error_count" -eq 0 ]; then
                print_status "SUCCESS" "No recent errors in logs"
            else
                print_status "WARNING" "Found $error_count recent errors in logs"
                echo "Last 5 error lines:"
                tail -5 "$LOG_DIR/error.log" | grep "ERROR\|FATAL" | head -5
            fi
        fi
        
        # Check combined logs
        if [ -f "$LOG_DIR/combined.log" ]; then
            echo ""
            echo "Recent activity (last 10 lines):"
            tail -10 "$LOG_DIR/combined.log"
        fi
    else
        print_status "WARNING" "Log directory not found: $LOG_DIR"
    fi
    
    echo ""
}

# Function to check network connectivity
check_network() {
    print_status "HEADER" "Network Connectivity"
    echo "============================="
    
    # Check localhost connectivity
    if curl -s "http://localhost:3000" >/dev/null 2>&1; then
        print_status "SUCCESS" "Local application is accessible"
    else
        print_status "ERROR" "Local application is not accessible"
    fi
    
    # Check external connectivity
    if curl -s "https://www.google.com" >/dev/null 2>&1; then
        print_status "SUCCESS" "External internet connectivity is working"
    else
        print_status "WARNING" "External internet connectivity issues detected"
    fi
    
    echo ""
}

# Function to show PM2 logs
show_pm2_logs() {
    print_status "HEADER" "PM2 Application Logs (Last 20 lines)"
    echo "================================================"
    
    if command_exists pm2; then
        pm2 logs "$APP_NAME" --lines 20 --nostream 2>/dev/null || echo "No logs available"
    else
        print_status "ERROR" "PM2 is not installed"
    fi
    
    echo ""
}

# Function to show real-time monitoring
show_realtime_monitoring() {
    print_status "HEADER" "Real-time Monitoring (Press Ctrl+C to exit)"
    echo "========================================================"
    
    if command_exists pm2; then
        pm2 monit
    else
        print_status "ERROR" "PM2 is not installed. Cannot show real-time monitoring."
    fi
}

# Function to show help
show_help() {
    echo "Socket Painting Canvas - Monitoring Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -a, --all           Run all checks (default)"
    echo "  -p, --pm2           Check PM2 status only"
    echo "  -h, --health        Check application health only"
    echo "  -l, --logs          Show recent logs only"
    echo "  -r, --realtime      Show real-time PM2 monitoring"
    echo "  -s, --system        Check system resources only"
    echo "  -n, --network       Check network connectivity only"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Run all checks"
    echo "  $0 --pm2            # Check PM2 status only"
    echo "  $0 --realtime       # Show real-time monitoring"
}

# Main execution
main() {
    case "${1:-}" in
        -p|--pm2)
            check_pm2_status
            ;;
        -h|--health)
            check_app_health
            ;;
        -l|--logs)
            check_logs
            show_pm2_logs
            ;;
        -r|--realtime)
            show_realtime_monitoring
            ;;
        -s|--system)
            check_system_resources
            ;;
        -n|--network)
            check_network
            ;;
        --help)
            show_help
            exit 0
            ;;
        -a|--all|"")
            check_pm2_status
            check_app_health
            check_api_endpoints
            check_system_resources
            check_logs
            check_network
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
