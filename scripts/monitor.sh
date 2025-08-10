#!/bin/bash

# Socket Painting Canvas - Monitoring Script
echo "📊 Socket Painting Canvas Monitoring Dashboard"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PM2 is running
if ! pgrep -f "PM2" > /dev/null; then
    echo -e "${RED}❌ PM2 is not running${NC}"
    exit 1
fi

# Application status
echo -e "\n${GREEN}📱 Application Status:${NC}"
pm2 status

# Memory and CPU usage
echo -e "\n${GREEN}💻 System Resources:${NC}"
pm2 list

# Recent logs
echo -e "\n${GREEN}📝 Recent Logs (last 50 lines):${NC}"
pm2 logs socket-painting-app --lines 50

# Health check
echo -e "\n${GREEN}🏥 Health Check:${NC}"
SERVER_PORT=${PORT:-3000}
if curl -s -f http://localhost:$SERVER_PORT/api/health > /dev/null; then
    echo -e "${GREEN}✅ Application is responding${NC}"
else
    echo -e "${RED}❌ Application is not responding${NC}"
fi

# Socket connections (if netstat is available)
if command -v netstat &> /dev/null; then
    echo -e "\n${GREEN}🔌 Socket Connections:${NC}"
    netstat -an | grep ":$SERVER_PORT" | wc -l | xargs echo "Active connections:"
fi

echo -e "\n${YELLOW}💡 Monitoring Commands:${NC}"
echo "   pm2 logs socket-painting-app --follow  # Follow logs in real-time"
echo "   pm2 monit                              # Real-time monitoring"
echo "   pm2 restart socket-painting-app        # Restart application"
