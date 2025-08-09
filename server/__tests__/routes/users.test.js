const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/users');

describe('User Routes', () => {
  let app;
  let mockSocketHandler;

  beforeEach(() => {
    app = express();
    
    // Mock socket handler
    mockSocketHandler = {
      getUserCount: jest.fn()
    };
    
    // Set mock socket handler in app locals
    app.locals.socketHandler = mockSocketHandler;
    
    app.use('/users', userRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/', () => {
    it('should return user count when socket handler is available', async () => {
      const mockUserCount = { currentUsers: 3, maxUsers: 10 };
      mockSocketHandler.getUserCount.mockReturnValue(mockUserCount);

      const response = await request(app)
        .get('/users/')
        .expect(200);

      expect(response.body).toEqual(mockUserCount);
      expect(mockSocketHandler.getUserCount).toHaveBeenCalledTimes(1);
    });

    it('should return JSON content type', async () => {
      const mockUserCount = { currentUsers: 1, maxUsers: 10 };
      mockSocketHandler.getUserCount.mockReturnValue(mockUserCount);

      const response = await request(app)
        .get('/users/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle zero users', async () => {
      const mockUserCount = { currentUsers: 0, maxUsers: 10 };
      mockSocketHandler.getUserCount.mockReturnValue(mockUserCount);

      const response = await request(app)
        .get('/users/')
        .expect(200);

      expect(response.body).toEqual(mockUserCount);
    });

    it('should handle maximum users', async () => {
      const mockUserCount = { currentUsers: 10, maxUsers: 10 };
      mockSocketHandler.getUserCount.mockReturnValue(mockUserCount);

      const response = await request(app)
        .get('/users/')
        .expect(200);

      expect(response.body).toEqual(mockUserCount);
    });

    it('should return 503 when socket handler is not available', async () => {
      // Remove socket handler from app locals
      app.locals.socketHandler = null;

      const response = await request(app)
        .get('/users/')
        .expect(503);

      expect(response.body).toEqual({
        error: 'Socket handler not available',
        status: 'Service unavailable'
      });
    });

    it('should return 503 when socket handler is undefined', async () => {
      // Set socket handler to undefined
      app.locals.socketHandler = undefined;

      const response = await request(app)
        .get('/users/')
        .expect(503);

      expect(response.body).toEqual({
        error: 'Socket handler not available',
        status: 'Service unavailable'
      });
    });

    it('should return 500 when socket handler throws error', async () => {
      const errorMessage = 'Database connection failed';
      mockSocketHandler.getUserCount.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const response = await request(app)
        .get('/users/')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to get user count',
        message: errorMessage
      });
    });

    it('should handle socket handler method not being a function', async () => {
      // Set getUserCount to a non-function value
      app.locals.socketHandler = { getUserCount: 'not a function' };

      const response = await request(app)
        .get('/users/')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to get user count');
      expect(response.body).toHaveProperty('message');
    });

    it('should log error when exception occurs', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockSocketHandler.getUserCount.mockImplementation(() => {
        throw new Error('Test error');
      });

      await request(app)
        .get('/users/')
        .expect(500);

      expect(consoleSpy).toHaveBeenCalledWith('Error getting user count:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});
