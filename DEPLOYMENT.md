# Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- PM2 (for production deployment)
- Git (for version control)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd socketPaintingOnCanvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Start development servers**
   ```bash
   ./scripts/start-app.sh
   ```
   
   This script will:
   - Check and install dependencies if needed
   - Start the backend server
   - Start the React development server
   - Open both servers on configured ports

## Production Deployment

### Option 1: Using Deployment Scripts (Recommended)

1. **Setup production environment**
   ```bash
   cp config.prod.env.example config.prod.env
   # Edit config.prod.env with your production values
   ```

2. **Run production deployment**
   ```bash
   ./scripts/deploy-production.sh
   ```
   
   This script will:
   - Check all prerequisites (Node.js, npm, PM2)
   - Stop any existing processes
   - Clean up old builds
   - Install dependencies
   - Build the React application
   - Start the application with PM2
   - Verify deployment
   - Show comprehensive summary

3. **Deployment options**
   ```bash
   # Skip dependency installation (if already installed)
   ./scripts/deploy-production.sh --skip-deps
   
   # Skip build (if build already exists)
   ./scripts/deploy-production.sh --skip-build
   
   # Only verify existing deployment
   ./scripts/deploy-production.sh --verify-only
   ```

### Option 2: Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Install server dependencies**
   ```bash
   cd server && npm ci --production && cd ..
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

## Monitoring and Maintenance

### Real-time Monitoring

1. **PM2 Dashboard**
   ```bash
   pm2 monit
   ```

2. **Comprehensive Monitoring Script**
   ```bash
   # Full system check
   ./scripts/monitor.sh
   
   # Specific checks
   ./scripts/monitor.sh --pm2        # PM2 status only
   ./scripts/monitor.sh --health     # Health check only
   ./scripts/monitor.sh --logs       # Recent logs only
   ./scripts/monitor.sh --realtime   # Real-time PM2 monitoring
   ./scripts/monitor.sh --system     # System resources only
   ./scripts/monitor.sh --network    # Network connectivity only
   ```

### Health Checks

1. **Basic Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **API Health Check**
   ```bash
   curl http://localhost:3000/api
   ```

3. **API Health Check**
   ```bash
   curl http://localhost:3000/api
   curl http://localhost:3000/api/users
   ```

### Log Management

1. **View PM2 logs**
   ```bash
   pm2 logs socket-painting-app
   pm2 logs socket-painting-app --lines 100
   ```

2. **Log files location**
   ```
   ./logs/
   ├── combined.log      # All logs combined
   ├── out.log          # Standard output
   └── error.log        # Error logs only
   ```

## Architecture Features

### Core Functionality

- **Socket.IO Integration**: Real-time collaborative drawing
- **Express Server**: Lightweight API server
- **Static File Serving**: Production build support
- **Error Handling**: Basic error responses
- **Graceful Shutdown**: Proper process termination handling

### Monitoring & Observability

- **Basic Health Checks**: Application status monitoring
- **Request Logging**: API request tracking with morgan
- **PM2 Integration**: Process management and monitoring

## PM2 Configuration Best Practices

### Process Management

```javascript
{
  name: 'socket-painting-app',
  script: './server/server.js',
  instances: 1,
  exec_mode: 'cluster',
  
  // Health monitoring
  health_check_grace_period: 3000,
  health_check_fatal_exceptions: true,
  
  // Process management
  max_memory_restart: '500M',
  min_uptime: '10s',
  max_restarts: 10,
  restart_delay: 4000,
  
  // Performance tuning
  node_args: '--max-old-space-size=512',
  
  // Graceful shutdown
  kill_timeout: 5000,
  wait_ready: true,
  listen_timeout: 8000
}
```

### Logging Configuration

```javascript
{
  // Logging
  log_file: './logs/combined.log',
  out_file: './logs/out.log',
  error_file: './logs/error.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true
}
```

## Troubleshooting

### Common Issues

#### 1. "Route not found" Error

**Root Cause**: PM2 port conflicts between multiple processes
**Solution**: 
```bash
# Check for duplicate processes
pm2 status

# Stop and remove all processes
pm2 stop all
pm2 delete all

# Start fresh
pm2 start ecosystem.config.js --env production
pm2 save
```

#### 2. Port Already in Use

**Root Cause**: Another process using port 3000
**Solution**:
```bash
# Find what's using the port
sudo lsof -i :3000

# Kill the conflicting process
sudo kill -9 <PID>

# Restart application
pm2 restart socket-painting-app
```

#### 3. Application Not Starting

**Check**:
```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs socket-painting-app --lines 50

# Application health
curl http://localhost:3000/api/health

# System resources
./scripts/monitor.sh --system
```

#### 4. Build Failures

**Check**:
```bash
# Node.js version
node --version  # Should be >= 18

# Dependencies
npm ci --include=dev

# Build process
npm run build
```

### Performance Issues

#### 1. High Memory Usage

**Monitor**:
```bash
# Check memory usage
./scripts/monitor.sh --system

# PM2 memory info
pm2 show socket-painting-app
```

**Solutions**:
- Restart application: `pm2 restart socket-painting-app`
- Check for memory leaks in logs
- Increase memory limit in ecosystem.config.js

#### 2. High CPU Usage

**Monitor**:
```bash
# Real-time monitoring
pm2 monit

# System resources
./scripts/monitor.sh --system
```

**Solutions**:
- Check for infinite loops or heavy computations
- Monitor Socket.IO connections
- Scale horizontally if needed

## API Endpoints

### Health Monitoring

- `GET /api/health` - Basic health check

### API Routes

- `GET /api` - API information and available endpoints
- `GET /api/health` - API health status
- `GET /api/users` - Current user count

### Response Format

**Health Endpoint (`/api/health`)**:
- `status`: Response status (e.g., "OK")
- `timestamp`: ISO 8601 timestamp
- `service`: Service name
- `version`: API version

**Users Endpoint (`/api/users`)**:
- Returns user count object from socket handler

**Error responses include**:
- `error`: Error description
- `status`: Error status (for service unavailable)
- `message`: Detailed error message (for 500 errors)

## Environment Variables

### Required Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=https://yourdomain.com

# PM2 Configuration (optional)
PM2_UID=1000
PM2_GID=1000
```

### Optional Variables

```bash
# Deployment Configuration
DEPLOY_USER=deploy
DEPLOY_HOST=your-server.com
DEPLOY_PATH=/var/www/socket-painting-app
REPO_URL=https://github.com/username/repo.git
DEFAULT_BRANCH=main
```

## Maintenance Commands

### Daily Operations

```bash
# Check application status
./scripts/monitor.sh

# View recent logs
pm2 logs socket-painting-app --lines 50

# Check system resources
./scripts/monitor.sh --system
```

### Weekly Operations

```bash
# Clean old log files
find ./logs -name "*.log" -mtime +7 -delete

# Check for updates
git fetch origin
git status

# Restart application (if needed)
pm2 restart socket-painting-app
```

### Monthly Operations

```bash
# Full system health check
./scripts/monitor.sh --all

# Update dependencies
npm update
cd server && npm update && cd ..

# Rebuild and redeploy
./scripts/deploy-production.sh --skip-deps
```

## Best Practices Summary

### 1. **Process Management**
- Use PM2 for production process management
- Implement health checks and graceful shutdown
- Monitor memory and CPU usage
- Set appropriate restart policies

### 2. **Security**
- Basic input validation
- Secure error handling
- Environment-based configuration

### 3. **Performance**
- Monitor and optimize memory usage
- Use cluster mode for better performance
- Efficient Socket.IO connections

### 4. **Monitoring**
- Basic health check endpoints
- Real-time monitoring with PM2
- Structured logging with morgan
- Process health monitoring

### 5. **Deployment**
- Automated deployment scripts
- Environment-specific configurations
- Dependency management best practices
- Build verification and testing

### 6. **Maintenance**
- Regular health checks
- Log rotation and cleanup
- Dependency updates
- Performance monitoring

## Support and Resources

- **Issues**: [GitHub Issues](https://github.com/wilbertopachecob/socketPaintingOnCanvas/issues)
- **Documentation**: [README.md](./README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Monitoring**: `./scripts/monitor.sh --help`
- **Deployment**: `./scripts/deploy-production.sh --help`
