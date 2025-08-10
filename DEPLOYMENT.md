# Socket Painting Canvas - Deployment Guide

This guide covers deploying the Socket Painting Canvas application to production using PM2 and Cloudflare.

## 🚀 Live Application

**Production URL:** [https://paint.wilbertopachecob.dev/](https://paint.wilbertopachecob.dev/)

## 📋 Prerequisites

- Node.js 14+ installed on your server
- PM2 process manager (`npm install -g pm2`)
- Domain configured with Cloudflare
- SSL certificate (handled by Cloudflare)
- Server with public IP address

## 🏗️ Architecture Overview

```
Internet → Cloudflare → Your Server (PM2) → React App + Socket.IO Server
```

- **Frontend**: React application with Socket.IO client
- **Backend**: Express.js server with Socket.IO
- **Process Manager**: PM2 for production deployment
- **CDN/Proxy**: Cloudflare for SSL, caching, and DDoS protection

## 🔧 Local Development Setup

```bash
# Clone repository
git clone https://github.com/wilbertopachecob/socketPaintingOnCanvas.git
cd socketPaintingOnCanvas

# Install dependencies
npm install

# Start development servers
./scripts/start-app.sh
```

## 📦 Production Deployment

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/socket-painting-app
sudo chown $USER:$USER /var/www/socket-painting-app
```

### Step 2: Deploy Application

```bash
# Clone repository to server
cd /var/www/socket-painting-app
git clone https://github.com/wilbertopachecob/socketPaintingOnCanvas.git .

# Install production dependencies
npm ci --production

# Build React application
npm run build

# Configure environment
cp config.prod.env.example config.prod.env
# Edit config.prod.env with your domain

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Step 3: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Optional: Allow direct access to app port (for debugging)
sudo ufw allow 3000
```

## ☁️ Cloudflare Configuration

### Step 1: Domain Setup

1. Add your domain to Cloudflare
2. Update nameservers at your domain registrar
3. Enable SSL/TLS (Full or Full Strict mode)

### Step 2: DNS Configuration

```
Type: A
Name: paint (or @)
Content: YOUR_SERVER_IP
Proxy: Enabled (orange cloud)
```

### Step 3: Page Rules (Optional)

Create page rules for better performance:

```
paint.wilbertopachecob.dev/*
- Browser Cache TTL: 4 hours
- Cache Level: Standard
```

## 🔄 Updating Deployment

### Method 1: Using Update Script

```bash
# Run the update script locally
./scripts/update-live.sh

# Then on server:
cd /var/www/socket-painting-app
git pull origin master
npm ci --production
npm run build
pm2 reload ecosystem.config.js --env production
```

### Method 2: Manual Update

```bash
# On server
cd /var/www/socket-painting-app

# Pull latest changes
git pull origin master

# Install any new dependencies
npm ci --production

# Rebuild application
npm run build

# Restart PM2 process
pm2 restart socket-painting-app

# Check status
pm2 status
```

## 📊 Monitoring

### PM2 Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs socket-painting-app

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart socket-painting-app

# Stop application
pm2 stop socket-painting-app
```

### Health Check

```bash
# Check if application is responding
curl -f http://localhost:3000/api/health

# Or from external
curl -f https://paint.wilbertopachecob.dev/api/health
```

### Using Monitor Script

```bash
# Run monitoring script
./scripts/monitor.sh
```

## 🔒 Security Considerations

### Server Security

```bash
# Update packages regularly
sudo apt update && sudo apt upgrade -y

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Setup fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### Application Security

- Environment variables are used for sensitive configuration
- CORS is properly configured for production domain
- Rate limiting can be added for API endpoints
- Socket.IO has origin restrictions

## 🐛 Troubleshooting

### Common Issues

1. **Application not starting:**
   ```bash
   pm2 logs socket-painting-app
   ```

2. **Port already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

3. **Build failures:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Socket.IO connection issues:**
   - Check CORS configuration in `config.prod.env`
   - Verify Cloudflare WebSocket support is enabled

### Logs Location

- PM2 logs: `~/.pm2/logs/`
- Application logs: `./logs/` (if configured)
- System logs: `/var/log/`

## 📈 Performance Optimization

### PM2 Clustering

Update `ecosystem.config.js`:

```javascript
{
  instances: 'max', // Use all CPU cores
  exec_mode: 'cluster'
}
```

### Cloudflare Optimizations

1. Enable Auto Minify (CSS, JS, HTML)
2. Enable Brotli compression
3. Configure appropriate Cache Rules
4. Enable HTTP/2

## 🔄 Backup Strategy

### Automated Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "/backup/socket-painting-app-$DATE.tar.gz" /var/www/socket-painting-app
```

### Database Backups

If you add a database later:

```bash
# MongoDB example
mongodump --out /backup/mongodb-$DATE/

# PostgreSQL example
pg_dump dbname > /backup/postgres-$DATE.sql
```

## 📞 Support

For issues related to deployment:

1. Check the logs: `pm2 logs socket-painting-app`
2. Verify configuration: `pm2 show socket-painting-app`
3. Test health endpoint: `curl https://paint.wilbertopachecob.dev/api/health`
4. Review this documentation

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
