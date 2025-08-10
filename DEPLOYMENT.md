# Deployment Guide

## Prerequisites

- Node.js >= 14.0.0
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

### Option 1: Using Deployment Scripts

1. **Setup production environment**
   ```bash
   cp config.prod.env.example config.prod.env
   # Edit config.prod.env with your production values
   ```

2. **Deploy to production**
   ```bash
   ./scripts/deploy.sh
   ```
   
   This script will:
   - Install root dependencies (including build tools like webpack)
   - Install server dependencies
   - Build the application
   - Start the application with PM2

### Option 2: Manual Deployment

1. **Install dependencies**
   ```bash
   npm ci  # Install root dependencies (including build tools)
   cd server && npm ci --production && cd ..  # Install server dependencies
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

### Option 3: Using npm Scripts

1. **Setup production**
   ```bash
   npm run setup:prod
   ```

2. **Update production deployment**
   ```bash
   npm run deploy:prod
   ```

## Live Deployment Updates

For updating an already deployed application:

1. **Prepare local build**
   ```bash
   ./scripts/update-live.sh
   ```

2. **Deploy to server**
   ```bash
   # SSH into your server
   ssh your-username@your-server-ip
   
   # Navigate to app directory
   cd /var/www/socket-painting-app
   
   # Pull latest changes
   git pull origin main
   
   # Install dependencies and build
   npm ci  # Install root dependencies (including build tools)
   cd server && npm ci --production && cd ..  # Install server dependencies
   npm run build
   
   # Reload PM2
   pm2 reload ecosystem.config.js --env production
   pm2 save
   ```

## Important Notes

### Dependency Installation Order

The deployment process requires installing dependencies in the correct order:

1. **Root dependencies first** - These include build tools like webpack, TypeScript, and Babel
2. **Server dependencies second** - These are the production server dependencies
3. **Build the application** - This step requires the build tools from step 1

### Why This Order Matters

- **Webpack and build tools** are needed to compile the React/TypeScript code
- **Server dependencies** are needed to run the Node.js server
- **Build tools must be available** before running `npm run build`

### Common Issues

- **"webpack: not found"** - This happens when root dependencies aren't installed
- **Build failures** - Usually due to missing build tools or TypeScript dependencies
- **Runtime errors** - Often due to missing server dependencies

## Environment Configuration

### Development
- Uses `config.env` for local development
- Includes all dependencies for development and building

### Production
- Uses `config.prod.env` for production deployment
- Server runs with production-only dependencies
- Client is built and served as static files

## Monitoring and Maintenance

### PM2 Commands
```bash
pm2 status                    # Check application status
pm2 logs socket-painting-app # View application logs
pm2 monit                    # Monitor in real-time
pm2 restart socket-painting-app # Restart application
pm2 stop socket-painting-app    # Stop application
```

### Logs
- Application logs: `logs/` directory
- PM2 logs: `pm2 logs socket-painting-app`
- System logs: Check your server's log management

## Troubleshooting

### Build Issues
1. Ensure all dependencies are installed: `npm install`
2. Check Node.js version: `node --version` (should be >= 14.0.0)
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Deployment Issues
1. Verify environment variables are set correctly
2. Check PM2 is installed: `npm install -g pm2`
3. Ensure ports are available and not blocked by firewall
4. Check server logs for specific error messages

### Performance Issues
1. Monitor memory usage with PM2
2. Check for memory leaks in the application
3. Optimize build output with webpack configuration
4. Use production builds for better performance
