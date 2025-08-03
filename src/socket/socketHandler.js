const DrawingManager = require('./drawingManager');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.drawingManager = new DrawingManager();
    this.connectedUsers = new Set();
    this.maxUsers = 10; // Limit to 10 users
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      // Check if we've reached the user limit
      if (this.connectedUsers.size >= this.maxUsers) {
        console.log(`Connection rejected: User limit reached (${this.maxUsers} users)`);
        socket.emit('connection_rejected', { 
          message: 'Server is at maximum capacity. Please try again later.',
          maxUsers: this.maxUsers
        });
        socket.disconnect();
        return;
      }

      // Add user to connected users set
      this.connectedUsers.add(socket.id);
      console.log(`User connected: ${socket.id} (${this.connectedUsers.size}/${this.maxUsers} users)`);
      
      // Send current user count to all clients
      this.io.emit('user_count_update', { 
        currentUsers: this.connectedUsers.size, 
        maxUsers: this.maxUsers 
      });
      
      // Send existing drawing history to new user
      this.sendDrawingHistory(socket);
      
      // Handle drawing events
      socket.on('draw_line', (data) => {
        this.handleDrawLine(socket, data);
      });

      // Handle clear canvas
      socket.on('clear_canvas', () => {
        this.handleClearCanvas(socket);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        console.log(`User disconnected: ${socket.id} (${this.connectedUsers.size}/${this.maxUsers} users)`);
        
        // Update user count for remaining clients
        this.io.emit('user_count_update', { 
          currentUsers: this.connectedUsers.size, 
          maxUsers: this.maxUsers 
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  sendDrawingHistory(socket) {
    const history = this.drawingManager.getHistory();
    history.forEach(line => {
      socket.emit('draw_line', { line });
    });
  }

  handleDrawLine(socket, data) {
    try {
      if (!data || !data.line || !Array.isArray(data.line) || data.line.length !== 2) {
        throw new Error('Invalid line data format');
      }

      const line = data.line;
      const [start, end] = line;

      // Validate coordinates
      if (!this.isValidCoordinate(start) || !this.isValidCoordinate(end)) {
        throw new Error('Invalid coordinates');
      }

      // Add line to history
      this.drawingManager.addLine(line);
      
      // Broadcast to all clients
      this.io.emit('draw_line', { line });
      
    } catch (error) {
      console.error('Error handling draw_line:', error.message);
      socket.emit('error', { message: 'Invalid drawing data' });
    }
  }

  handleClearCanvas(socket) {
    try {
      this.drawingManager.clearHistory();
      this.io.emit('clear_canvas');
      console.log(`Canvas cleared by user: ${socket.id}`);
    } catch (error) {
      console.error('Error clearing canvas:', error.message);
      socket.emit('error', { message: 'Failed to clear canvas' });
    }
  }

  isValidCoordinate(coord) {
    return !!(coord && 
           typeof coord.x === 'number' && 
           typeof coord.y === 'number' &&
           coord.x >= 0 && coord.x <= 1 &&
           coord.y >= 0 && coord.y <= 1);
  }

  // Get current user count and limit
  getUserCount() {
    return {
      currentUsers: this.connectedUsers.size,
      maxUsers: this.maxUsers
    };
  }
}

module.exports = function(io) {
  return new SocketHandler(io);
}; 