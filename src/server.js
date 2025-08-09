const express = require('express');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const socketHandler = require('./socket/socketHandler');
const routes = require('./routes');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve React build
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
} else {
  // In development, serve the React app via webpack dev server
  // For static assets, serve from dist if available, otherwise skip
  const distPath = path.join(__dirname, '../dist');
  if (require('fs').existsSync(distPath)) {
    app.use(express.static(distPath));
  }
}

// Socket.IO handler
const socketHandlerInstance = socketHandler(io);

// Store socket handler instance in app locals for routes to access
app.locals.socketHandler = socketHandlerInstance;

// Legacy route redirects for backward compatibility (must come before API routes)
app.get('/health', (req, res) => {
  res.redirect(301, '/api/health');
});

app.get('/users', (req, res) => {
  res.redirect(301, '/api/users');
});

// API routes
app.use('/api', routes);

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback for development when dist doesn't exist
    res.status(503).send('React app not built. Run npm run build first.');
  }
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io }; 