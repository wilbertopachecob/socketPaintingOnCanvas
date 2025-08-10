module.exports = {
  apps: [
    {
      name: 'socket-painting-app',
      script: './server/server.js',
      instances: 1, // Start with 1, can scale later
      exec_mode: 'cluster',
      env_file: './config.prod.env',
      
      // Environment configuration
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Process management
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Monitoring and debugging
      watch: false, // Don't watch in production
      ignore_watch: ['node_modules', 'logs', 'dist', '.git'],
      
      // Auto restart options
      autorestart: true,
      exp_backoff_restart_delay: 100,
      
      // Performance tuning
      node_args: '--max-old-space-size=512',
      
      // Security
      uid: process.env.PM2_UID || '',
      gid: process.env.PM2_GID || '',
      
      // Environment variables for monitoring
      pmx: true,
      
      // Kill timeout
      kill_timeout: 5000,
      
      // Wait ready
      wait_ready: true,
      listen_timeout: 8000
    }
  ],
  
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || '',
      host: process.env.DEPLOY_HOST || '',
      ref: `origin/${process.env.DEFAULT_BRANCH || 'main'}`,
      repo: process.env.REPO_URL || 'https://github.com/wilbertopachecob/socketPaintingOnCanvas.git',
      path: process.env.DEPLOY_PATH || '/var/www/socket-painting-app',
      'pre-deploy-local': 'echo "This is a local executed command"',
      'post-deploy': 'npm ci --include=dev && cd server && npm ci --production && cd .. && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': 'echo "This command will be executed on the host before the setup process starts"',
      'post-setup': 'echo "This command will be executed on the host after cloning the repo"'
    },
    
    staging: {
      user: process.env.STAGING_USER || '',
      host: process.env.STAGING_HOST || '',
      ref: 'origin/develop',
      repo: process.env.REPO_URL || 'https://github.com/wilbertopachecob/socketPaintingOnCanvas.git',
      path: process.env.STAGING_PATH || '/var/www/socket-painting-app-staging',
      'post-deploy': 'npm ci --include=dev && cd server && npm ci --production && cd .. && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save'
    }
  }
};
