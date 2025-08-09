#!/bin/bash

# Socket Painting Canvas - Port Configuration Script
echo "🔧 Socket Painting Canvas Port Configuration"

# Default values
DEFAULT_SERVER_PORT=3000
DEFAULT_CLIENT_PORT=3001

# Function to show current configuration
show_current_config() {
    echo ""
    echo "📋 Current Configuration:"
    if [ -f "config.env" ]; then
        echo "   Server Port: $(grep '^PORT=' config.env | cut -d'=' -f2 || echo 'Not set')"
        echo "   Client Port: $(grep '^CLIENT_PORT=' config.env | cut -d'=' -f2 || echo 'Not set')"
        echo "   Environment: $(grep '^NODE_ENV=' config.env | cut -d'=' -f2 || echo 'Not set')"
    else
        echo "   No config.env file found - using defaults"
        echo "   Server Port: $DEFAULT_SERVER_PORT (default)"
        echo "   Client Port: $DEFAULT_CLIENT_PORT (default)"
    fi
    echo ""
}

# Function to update config
update_config() {
    local server_port=$1
    local client_port=$2
    
    # Backup existing config if it exists
    if [ -f "config.env" ]; then
        cp config.env config.env.backup
        echo "📂 Backed up existing config to config.env.backup"
    fi
    
    # Update the config file
    cat > config.env << EOF
# Socket Painting Canvas Environment Configuration

# Server Configuration
PORT=$server_port
NODE_ENV=development

# Frontend Development Server
CLIENT_PORT=$client_port

# Development URLs
CLIENT_DEV_URL=http://localhost:$client_port
SERVER_URL=http://localhost:$server_port

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:$client_port

# Logging
LOG_LEVEL=info

# Maximum Users
MAX_USERS=10
EOF

    echo "✅ Configuration updated successfully!"
}

# Show current configuration
show_current_config

# Interactive mode
if [ $# -eq 0 ]; then
    echo "🔄 Interactive Port Configuration"
    echo ""
    
    # Get server port
    read -p "Enter server port [$DEFAULT_SERVER_PORT]: " server_port
    server_port=${server_port:-$DEFAULT_SERVER_PORT}
    
    # Validate server port
    if ! [[ "$server_port" =~ ^[0-9]+$ ]] || [ "$server_port" -lt 1024 ] || [ "$server_port" -gt 65535 ]; then
        echo "❌ Invalid server port. Please use a number between 1024-65535"
        exit 1
    fi
    
    # Get client port
    read -p "Enter client port [$DEFAULT_CLIENT_PORT]: " client_port
    client_port=${client_port:-$DEFAULT_CLIENT_PORT}
    
    # Validate client port
    if ! [[ "$client_port" =~ ^[0-9]+$ ]] || [ "$client_port" -lt 1024 ] || [ "$client_port" -gt 65535 ]; then
        echo "❌ Invalid client port. Please use a number between 1024-65535"
        exit 1
    fi
    
    # Check if ports are the same
    if [ "$server_port" -eq "$client_port" ]; then
        echo "❌ Server and client ports cannot be the same"
        exit 1
    fi
    
    # Check if ports are in use
    if lsof -i :$server_port > /dev/null 2>&1; then
        echo "⚠️  Warning: Port $server_port is currently in use"
        read -p "Continue anyway? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 1
        fi
    fi
    
    if lsof -i :$client_port > /dev/null 2>&1; then
        echo "⚠️  Warning: Port $client_port is currently in use"
        read -p "Continue anyway? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 1
        fi
    fi
    
    update_config $server_port $client_port
    show_current_config
    
    echo "💡 To apply the new configuration:"
    echo "   1. Run: ./scripts/stop-app.sh (if running)"
    echo "   2. Run: ./scripts/start-app.sh"
    
# Command line mode
elif [ $# -eq 2 ]; then
    server_port=$1
    client_port=$2
    
    # Validate ports
    if ! [[ "$server_port" =~ ^[0-9]+$ ]] || [ "$server_port" -lt 1024 ] || [ "$server_port" -gt 65535 ]; then
        echo "❌ Invalid server port: $server_port"
        exit 1
    fi
    
    if ! [[ "$client_port" =~ ^[0-9]+$ ]] || [ "$client_port" -lt 1024 ] || [ "$client_port" -gt 65535 ]; then
        echo "❌ Invalid client port: $client_port"
        exit 1
    fi
    
    if [ "$server_port" -eq "$client_port" ]; then
        echo "❌ Server and client ports cannot be the same"
        exit 1
    fi
    
    update_config $server_port $client_port
    show_current_config
    
    echo "✅ Ports configured successfully!"
    
else
    echo "📖 Usage:"
    echo "   Interactive mode: $0"
    echo "   Command line:     $0 <server_port> <client_port>"
    echo ""
    echo "📝 Examples:"
    echo "   $0                    # Interactive mode"
    echo "   $0 3000 3001         # Set server to 3000, client to 3001"
    echo "   $0 8080 8081         # Set server to 8080, client to 8081"
    exit 1
fi
