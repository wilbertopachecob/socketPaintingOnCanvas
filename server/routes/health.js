const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Collaborative Drawing Canvas',
    version: '1.0.0'
  });
});

module.exports = router; 