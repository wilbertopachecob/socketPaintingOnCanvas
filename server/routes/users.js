const express = require('express');
const router = express.Router();

// Get current user count
router.get('/', (req, res) => {
  try {
    // Get socket handler instance from app locals
    const socketHandlerInstance = req.app.locals.socketHandler;
    
    if (!socketHandlerInstance) {
      return res.status(503).json({ 
        error: 'Socket handler not available',
        status: 'Service unavailable'
      });
    }

    const userCount = socketHandlerInstance.getUserCount();
    res.status(200).json(userCount);
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ 
      error: 'Failed to get user count',
      message: error.message 
    });
  }
});

module.exports = router; 