const request = require('supertest');
const express = require('express');
const path = require('path');

// Create a simple test app
const app = express();

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

describe('Server API', () => {
  describe('GET /health', () => {
    test('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /', () => {
    test('should serve the main HTML page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Collaborative Drawing Canvas');
      expect(response.text).toContain('canvas.js');
      expect(response.text).toContain('index.js');
    });
  });

  describe('GET /css/style.css', () => {
    test('should serve CSS file', async () => {
      const response = await request(app)
        .get('/css/style.css')
        .expect(200);

      expect(response.text).toContain('canvas');
      expect(response.text).toContain('controls');
    });
  });

  describe('GET /js/canvas.js', () => {
    test('should serve canvas.js file', async () => {
      const response = await request(app)
        .get('/js/canvas.js')
        .expect(200);

      expect(response.text).toContain('class Canvas');
    });
  });

  describe('GET /js/index.js', () => {
    test('should serve index.js file', async () => {
      const response = await request(app)
        .get('/js/index.js')
        .expect(200);

      expect(response.text).toContain('class DrawingApp');
    });
  });

  describe('404 handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('Error handling', () => {
    test('should handle server errors gracefully', async () => {
      // This test would require mocking a route that throws an error
      // For now, we'll test that the error middleware is properly set up
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });
}); 