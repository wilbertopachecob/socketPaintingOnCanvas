const express = require('express');
const healthRoutes = require('./health');
const userRoutes = require('./users');

const router = express.Router();

// Request logging middleware for API routes
router.use((req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Mount route modules
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

// API root endpoint with comprehensive information
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Collaborative Drawing Canvas API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: {
        path: '/health',
        description: 'Health check endpoint',
        methods: ['GET']
      },
      users: {
        path: '/users',
        description: 'User management and statistics',
        methods: ['GET']
      }
    },
    documentation: 'See README.md for detailed API documentation',
    support: {
      issues: 'https://github.com/wilbertopachecob/socketPaintingOnCanvas/issues',
      repository: 'https://github.com/wilbertopachecob/socketPaintingOnCanvas'
    }
  });
});

// 404 handler for undefined API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: ['/health', '/users'],
    message: 'Check the API root endpoint for available routes'
  });
});

module.exports = router; 