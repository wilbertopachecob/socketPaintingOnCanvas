const request = require('supertest');
const express = require('express');
const healthRoutes = require('../../src/routes/health');

describe('Health Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRoutes);
  });

  describe('GET /health/', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health/')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Collaborative Drawing Canvas');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/health/')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/health/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return current timestamp', async () => {
      const beforeRequest = new Date();
      
      const response = await request(app)
        .get('/health/')
        .expect(200);
      
      const afterRequest = new Date();
      const responseTimestamp = new Date(response.body.timestamp);

      expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(responseTimestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });
  });
});
