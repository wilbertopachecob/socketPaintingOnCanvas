const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const express = require('express');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const socketHandler = require('./socket/socketHandler');
const routes = require('./routes');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.IO configuration with CORS
const io = socketIO(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve React build
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
      lastModified: true
    }));
  } else {
    console.warn('⚠️  Production build not found. Run npm run build first.');
  }
} else {
  // In development, serve static assets from dist if available
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }
}

// Socket.IO handler
const socketHandlerInstance = socketHandler(io);

// Store socket handler instance in app locals for routes to access
app.locals.socketHandler = socketHandlerInstance;

// API routes
app.use('/api', routes);

// Health check endpoint (for load balancers)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Collaborative Drawing Canvas',
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  
  // Don't leak error details in production
  const errorMessage = NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    error: errorMessage,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: ['/api/health', '/api/users']
  });
});

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).json({
      error: 'Application not built',
      message: 'React app not built. Run npm run build first.',
      environment: NODE_ENV
    });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`📱 Environment: ${NODE_ENV}`);
  console.log(`🔌 Socket.IO enabled with CORS origin: ${process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3001'}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server, io }; 