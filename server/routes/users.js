const express = require('express');
const router = express.Router();

// Get current user count and statistics
router.get('/', (req, res) => {
  try {
    // Get socket handler instance from app locals
    const socketHandlerInstance = req.app.locals.socketHandler;
    
    if (!socketHandlerInstance) {
      return res.status(503).json({ 
        error: 'Socket handler not available',
        status: 'Service unavailable',
        timestamp: new Date().toISOString(),
        retryAfter: 30
      });
    }

    const userCount = socketHandlerInstance.getUserCount();
    const userStats = {
      currentUsers: userCount,
      timestamp: new Date().toISOString(),
      service: 'Collaborative Drawing Canvas',
      endpoint: '/api/users'
    };
    
    res.status(200).json(userStats);
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ 
      error: 'Failed to get user count',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    });
  }
});

// Get detailed user statistics
router.get('/stats', (req, res) => {
  try {
    const socketHandlerInstance = req.app.locals.socketHandler;
    
    if (!socketHandlerInstance) {
      return res.status(503).json({ 
        error: 'Socket handler not available',
        status: 'Service unavailable',
        timestamp: new Date().toISOString()
      });
    }

    // Get additional user statistics if available
    const userStats = {
      currentUsers: socketHandlerInstance.getUserCount(),
      timestamp: new Date().toISOString(),
      service: 'Collaborative Drawing Canvas',
      endpoint: '/api/users/stats',
      statistics: {
        totalConnections: socketHandlerInstance.getTotalConnections ? socketHandlerInstance.getTotalConnections() : 'N/A',
        activeRooms: socketHandlerInstance.getActiveRooms ? socketHandlerInstance.getActiveRooms() : 'N/A',
        peakUsers: socketHandlerInstance.getPeakUsers ? socketHandlerInstance.getPeakUsers() : 'N/A'
      }
    };
    
    res.status(200).json(userStats);
  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get user statistics',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    });
  }
});

// Get user count by room (if rooms are implemented)
router.get('/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!roomId || roomId.trim() === '') {
      return res.status(400).json({
        error: 'Invalid room ID',
        message: 'Room ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const socketHandlerInstance = req.app.locals.socketHandler;
    
    if (!socketHandlerInstance) {
      return res.status(503).json({ 
        error: 'Socket handler not available',
        status: 'Service unavailable',
        timestamp: new Date().toISOString()
      });
    }

    // Check if room exists and get user count
    const roomUserCount = socketHandlerInstance.getRoomUserCount ? 
      socketHandlerInstance.getRoomUserCount(roomId) : null;
    
    if (roomUserCount === null) {
      return res.status(404).json({
        error: 'Room not found',
        message: `Room with ID '${roomId}' does not exist`,
        timestamp: new Date().toISOString()
      });
    }
    
    const roomStats = {
      roomId: roomId,
      userCount: roomUserCount,
      timestamp: new Date().toISOString(),
      service: 'Collaborative Drawing Canvas',
      endpoint: `/api/users/rooms/${roomId}`
    };
    
    res.status(200).json(roomStats);
  } catch (error) {
    console.error('Error getting room user count:', error);
    res.status(500).json({ 
      error: 'Failed to get room user count',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    });
  }
});

// Health check for users service
router.get('/health', (req, res) => {
  try {
    const socketHandlerInstance = req.app.locals.socketHandler;
    const isHealthy = socketHandlerInstance && typeof socketHandlerInstance.getUserCount === 'function';
    
    const healthStatus = {
      status: isHealthy ? 'OK' : 'DEGRADED',
      service: 'Users Service',
      timestamp: new Date().toISOString(),
      checks: {
        socketHandler: {
          status: socketHandlerInstance ? 'OK' : 'FAILED',
          message: socketHandlerInstance ? 'Socket handler available' : 'Socket handler not available'
        },
        getUserCount: {
          status: typeof socketHandlerInstance?.getUserCount === 'function' ? 'OK' : 'FAILED',
          message: typeof socketHandlerInstance?.getUserCount === 'function' ? 'Method available' : 'Method not available'
        }
      }
    };
    
    const overallStatus = healthStatus.checks.socketHandler.status === 'OK' && 
                         healthStatus.checks.getUserCount.status === 'OK' ? 'OK' : 'DEGRADED';
    
    healthStatus.status = overallStatus;
    
    res.status(overallStatus === 'OK' ? 200 : 503).json(healthStatus);
  } catch (error) {
    console.error('Users service health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: 'Users service health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to generate unique request IDs
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = router; 