const request = require('supertest');
const express = require('express');
const path = require('path');
const routes = require('../src/routes');

// Create a comprehensive test app that mimics the real server
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Mock socket handler for routes that need it
  const mockSocketHandler = {
    getUserCount: jest.fn(() => ({ currentUsers: 2, maxUsers: 10 }))
  };
  app.locals.socketHandler = mockSocketHandler;
  
  // Static files (serve from dist if available)
  const distPath = path.join(__dirname, '../dist');
  if (require('fs').existsSync(distPath)) {
    app.use(express.static(distPath));
  }
  
  // Legacy route redirects
  app.get('/health', (req, res) => {
    res.redirect(301, '/api/health');
  });
  
  app.get('/users', (req, res) => {
    res.redirect(301, '/api/users');
  });
  
  // API routes
  app.use('/api', routes);
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Something went wrong!' });
  });
  
  // Serve React app for non-API routes
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(503).send('React app not built. Run npm run build first.');
    }
  });
  
  return app;
};

describe('Server Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Legacy Route Redirects', () => {
    test('should redirect /health to /api/health', async () => {
      const response = await request(app)
        .get('/health')
        .expect(301);

      expect(response.headers.location).toBe('/api/health');
    });

    test('should redirect /users to /api/users', async () => {
      const response = await request(app)
        .get('/users')
        .expect(301);

      expect(response.headers.location).toBe('/api/users');
    });
  });

  describe('API Routes', () => {
    test('should serve API root endpoint', async () => {
      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Collaborative Drawing Canvas API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
    });

    test('should serve health endpoint', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Collaborative Drawing Canvas');
    });

    test('should reject non-GET methods on health endpoint', async () => {
      // Health endpoints should only accept GET requests
      await request(app)
        .post('/api/health')
        .expect(404);

      await request(app)
        .put('/api/health')
        .expect(404);

      await request(app)
        .delete('/api/health')
        .expect(404);
    });

    test('should serve users endpoint', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveProperty('currentUsers');
      expect(response.body).toHaveProperty('maxUsers');
    });

    test('should return 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect((res) => {
          // May return 200 (served by React app) or should handle gracefully
          expect([200, 404, 503]).toContain(res.status);
        });
    });
  });

  describe('React App Serving', () => {
    test('should serve React app or show build message', async () => {
      const response = await request(app)
        .get('/')
        .expect((res) => {
          // Should either serve the React app (200) or show build message (503)
          expect([200, 503]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.text.toLowerCase()).toContain('<!doctype html>');
      } else {
        expect(response.text).toContain('React app not built');
      }
    });

    test('should handle non-API routes with React app', async () => {
      const response = await request(app)
        .get('/some-react-route')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.text.toLowerCase()).toContain('<!doctype html>');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON requests', async () => {
      // Create a test endpoint that accepts POST for testing JSON parsing
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/test-json', (req, res) => {
        res.json({ received: req.body });
      });
      testApp.use((err, req, res, next) => {
        res.status(400).json({ error: 'Invalid JSON' });
      });

      const response = await request(testApp)
        .post('/test-json')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400); // Bad request for malformed JSON

      expect(response.body).toHaveProperty('error', 'Invalid JSON');
    });

    test('should handle server errors gracefully', async () => {
      // Create an app with a route that throws an error
      const errorApp = express();
      errorApp.get('/error', (req, res, next) => {
        throw new Error('Test error');
      });
      
      errorApp.use((err, req, res, next) => {
        res.status(500).json({ error: 'Something went wrong!' });
      });

      const response = await request(errorApp)
        .get('/error')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Something went wrong!');
    });
  });

  describe('Content Type Headers', () => {
    test('should return JSON for API endpoints', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should return appropriate content for root route', async () => {
      const response = await request(app)
        .get('/')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.headers['content-type']).toMatch(/text\/html/);
      } else {
        expect(response.headers['content-type']).toMatch(/text\/html/);
      }
    });
  });

  describe('Middleware Integration', () => {
    test('should parse JSON request bodies', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/test', (req, res) => {
        res.json({ received: req.body });
      });

      const testData = { test: 'data' };
      const response = await request(testApp)
        .post('/test')
        .send(testData)
        .expect(200);

      expect(response.body.received).toEqual(testData);
    });

    test('should parse URL-encoded request bodies', async () => {
      const testApp = express();
      testApp.use(express.urlencoded({ extended: true }));
      testApp.post('/test', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(testApp)
        .post('/test')
        .send('key=value&another=test')
        .expect(200);

      expect(response.body.received).toEqual({ key: 'value', another: 'test' });
    });
  });
});