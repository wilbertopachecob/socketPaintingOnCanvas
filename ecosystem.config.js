module.exports = {
  apps: [
    {
      name: 'socket-painting-app',
      script: './server/server.js',
      instances: 1, // Start with 1, can scale later
      exec_mode: 'cluster',
      env_file: './config.prod.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Monitoring
      watch: false, // Don't watch in production
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Auto restart options
      autorestart: true,
      
      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ],
  
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'deploy', // Set DEPLOY_USER in your environment
      host: process.env.DEPLOY_HOST || 'your-server-ip-or-domain', // Set DEPLOY_HOST in your environment
      ref: `origin/${process.env.DEFAULT_BRANCH || 'master'}`,
      repo: 'https://github.com/wilbertopachecob/socketPaintingOnCanvas.git', // Your repo
      path: '/var/www/socket-painting-app',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
