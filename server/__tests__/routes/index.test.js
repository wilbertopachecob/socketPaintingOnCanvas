const request = require('supertest');
const express = require('express');
const routes = require('../../routes');

describe('API Routes - Index', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/api', routes);
  });

  describe('GET /api/', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Collaborative Drawing Canvas API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          users: '/users'
        },
        documentation: 'See README.md for API documentation'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
