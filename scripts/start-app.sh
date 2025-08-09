#!/bin/bash

# Socket Painting Canvas - Start Script
echo "🚀 Starting Socket Painting Canvas Application..."

# Load environment variables
if [ -f "config.env" ]; then
    export $(cat config.env | grep -v '^#' | xargs)
fi

# Use environment variables for ports, with defaults
SERVER_PORT=${PORT:-3000}
CLIENT_PORT=${CLIENT_PORT:-3001}

echo "📋 Configuration:"
echo "   Server Port: $SERVER_PORT"
echo "   Client Port: $CLIENT_PORT"
echo "   Environment: ${NODE_ENV:-development}"

# Check if ports are already in use
check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo "⚠️  Port $port is already in use by $service"
        echo "   Run ./scripts/stop-app.sh first to stop existing processes"
        return 1
    fi
    return 0
}

# Kill any existing processes
echo "🧹 Cleaning up any existing processes..."
pkill -f "node.*server" > /dev/null 2>&1
pkill -f "webpack.*serve" > /dev/null 2>&1
sleep 2

# Check if ports are available
if ! check_port $SERVER_PORT "backend server"; then
    exit 1
fi

if ! check_port $CLIENT_PORT "webpack dev server"; then
    exit 1
fi

echo "✅ Ports are available"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the backend server
echo "🔧 Starting backend server on port $SERVER_PORT..."
npm run dev > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend server to start..."
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID > /dev/null 2>&1; then
    echo "❌ Backend server failed to start. Check logs/backend.log"
    exit 1
fi

# Verify backend is responding
for i in {1..10}; do
    if curl -s http://localhost:$SERVER_PORT/api/health > /dev/null 2>&1; then
        echo "✅ Backend server is responding"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Backend server is not responding after 10 attempts"
        kill $BACKEND_PID > /dev/null 2>&1
        exit 1
    fi
    echo "   Attempt $i/10: Waiting for backend..."
    sleep 1
done

# Start the frontend development server
echo "🎨 Starting React development server on port $CLIENT_PORT..."
npm run dev:client > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend server to start..."
sleep 5

# Check if frontend is running
if ! kill -0 $FRONTEND_PID > /dev/null 2>&1; then
    echo "❌ Frontend server failed to start. Check logs/frontend.log"
    kill $BACKEND_PID > /dev/null 2>&1
    exit 1
fi

# Save PIDs for stop script
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📍 Backend (API):     http://localhost:$SERVER_PORT"
echo "📍 Frontend (React):  http://localhost:$CLIENT_PORT"
echo "📍 Health Check:      http://localhost:$SERVER_PORT/api/health"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop the application, run: ./scripts/stop-app.sh"
echo ""
echo "✨ Happy coding! The React drawing app is ready to use."
