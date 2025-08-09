#!/bin/bash

# Socket Painting Canvas - Stop Script
echo "🛑 Stopping Socket Painting Canvas Application..."

# Load environment variables
if [ -f "config.env" ]; then
    export $(cat config.env | grep -v '^#' | xargs)
fi

# Use environment variables for ports, with defaults
SERVER_PORT=${PORT:-3000}
CLIENT_PORT=${CLIENT_PORT:-3001}

# Function to safely kill a process
kill_process() {
    local pid=$1
    local name=$2
    
    if [ -n "$pid" ] && kill -0 $pid > /dev/null 2>&1; then
        echo "🔄 Stopping $name (PID: $pid)..."
        kill $pid > /dev/null 2>&1
        
        # Wait for graceful shutdown
        for i in {1..5}; do
            if ! kill -0 $pid > /dev/null 2>&1; then
                echo "✅ $name stopped gracefully"
                return 0
            fi
            sleep 1
        done
        
        # Force kill if still running
        echo "⚡ Force stopping $name..."
        kill -9 $pid > /dev/null 2>&1
        sleep 1
        
        if ! kill -0 $pid > /dev/null 2>&1; then
            echo "✅ $name force stopped"
        else
            echo "❌ Failed to stop $name"
            return 1
        fi
    else
        echo "ℹ️  $name is not running (PID: $pid)"
    fi
    return 0
}

# Stop processes using saved PIDs
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill_process "$BACKEND_PID" "Backend server"
    rm -f .backend.pid
else
    echo "ℹ️  No backend PID file found"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill_process "$FRONTEND_PID" "Frontend server"
    rm -f .frontend.pid
else
    echo "ℹ️  No frontend PID file found"
fi

# Kill any remaining processes by name (fallback)
echo "🧹 Cleaning up any remaining processes..."

# Kill nodemon and node processes
if pkill -f "nodemon.*server" > /dev/null 2>&1; then
    echo "✅ Stopped nodemon processes"
fi

if pkill -f "node.*server" > /dev/null 2>&1; then
    echo "✅ Stopped node server processes"
fi

# Kill webpack dev server processes
if pkill -f "webpack.*serve" > /dev/null 2>&1; then
    echo "✅ Stopped webpack dev server processes"
fi

# Wait a moment for processes to fully terminate
sleep 2

# Verify ports are free
echo "🔍 Checking if ports are free..."

if lsof -i :$SERVER_PORT > /dev/null 2>&1; then
    echo "⚠️  Port $SERVER_PORT is still in use"
    echo "   Processes using port $SERVER_PORT:"
    lsof -i :$SERVER_PORT
else
    echo "✅ Port $SERVER_PORT is free"
fi

if lsof -i :$CLIENT_PORT > /dev/null 2>&1; then
    echo "⚠️  Port $CLIENT_PORT is still in use"
    echo "   Processes using port $CLIENT_PORT:"
    lsof -i :$CLIENT_PORT
else
    echo "✅ Port $CLIENT_PORT is free"
fi

echo ""
echo "🎯 Application stopped successfully!"
echo ""
echo "🚀 To start the application again, run: ./scripts/start-app.sh"
