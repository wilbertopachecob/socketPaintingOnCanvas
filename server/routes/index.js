const express = require('express');
const healthRoutes = require('./health');
const userRoutes = require('./users');

const router = express.Router();

// Mount route modules
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

// API root endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Collaborative Drawing Canvas API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/users'
    },
    documentation: 'See README.md for API documentation'
  });
});

module.exports = router; 