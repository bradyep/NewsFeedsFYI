import request from 'supertest';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { router as authRouter, initPassport, ensureAuthenticated } from '../../../server/routes/authenticate';

// Mock the database models
jest.mock('../../../server/models/users-sequelize');

const mockUsersModel = require('../../../server/models/users-sequelize');

describe('Authentication Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Setup session middleware (required for Passport)
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false
    }));

    // Initialize Passport
    initPassport(app);
    
    app.use('/authenticate', authRouter);

    // Test route to check authentication
    app.get('/protected', ensureAuthenticated, (req, res) => {
      res.json({ message: 'Access granted', user: req.user });
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockAuthCheck = {
        check: true,
        userid: 1,
        username: 'testuser'
      };

      const mockUser = {
        userID: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersModel.userPasswordCheck.mockResolvedValue(mockAuthCheck);
      mockUsersModel.read.mockResolvedValue(mockUser);

      const credentials = {
        username: 'testuser',
        password: 'correctpassword'
      };

      const response = await request(app)
        .post('/authenticate')
        .send(credentials)
        .expect(302); // Redirect on successful auth

      expect(response.headers.location).toBe('/users/1');
      expect(mockUsersModel.userPasswordCheck).toHaveBeenCalledWith('testuser', 'correctpassword');
    });

    it('should reject user with invalid credentials', async () => {
      const mockAuthCheck = {
        check: false,
        userid: 0,
        username: 'testuser',
        message: 'Invalid password'
      };

      mockUsersModel.userPasswordCheck.mockResolvedValue(mockAuthCheck);

      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/authenticate')
        .send(credentials)
        .expect(401); // Unauthorized

      expect(mockUsersModel.userPasswordCheck).toHaveBeenCalledWith('testuser', 'wrongpassword');
    });

    it('should handle user not found', async () => {
      const mockAuthCheck = {
        check: false,
        userid: 0,
        username: 'nonexistentuser',
        message: 'Could not find user'
      };

      mockUsersModel.userPasswordCheck.mockResolvedValue(mockAuthCheck);

      const credentials = {
        username: 'nonexistentuser',
        password: 'anypassword'
      };

      await request(app)
        .post('/authenticate')
        .send(credentials)
        .expect(401);

      expect(mockUsersModel.userPasswordCheck).toHaveBeenCalledWith('nonexistentuser', 'anypassword');
    });

    it('should handle database errors during authentication', async () => {
      mockUsersModel.userPasswordCheck.mockRejectedValue(new Error('Database connection failed'));

      const credentials = {
        username: 'testuser',
        password: 'password'
      };

      await request(app)
        .post('/authenticate')
        .send(credentials)
        .expect(500);
    });
  });

  describe('ensureAuthenticated middleware', () => {
    it('should allow access to protected routes when authenticated', async () => {
      // First authenticate
      const mockAuthCheck = {
        check: true,
        userid: 1,
        username: 'testuser'
      };

      const mockUser = {
        userID: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersModel.userPasswordCheck.mockResolvedValue(mockAuthCheck);
      mockUsersModel.read.mockResolvedValue(mockUser);

      const agent = request.agent(app);

      // Login first
      await agent
        .post('/authenticate')
        .send({ username: 'testuser', password: 'password' })
        .expect(302);

      // Then access protected route
      const response = await agent
        .get('/protected')
        .expect(200);

      expect(response.body.message).toBe('Access granted');
    });

    it('should redirect unauthenticated users to login', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(302);

      expect(response.headers.location).toBe('/users/login');
    });
  });

  describe('Passport serialization/deserialization', () => {
    it('should properly serialize and deserialize user', async () => {
      const mockUser = {
        userID: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      mockUsersModel.read.mockResolvedValue(mockUser);

      // Test serialization by checking if user data persists in session
      const mockAuthCheck = {
        check: true,
        userid: 1,
        username: 'testuser'
      };

      mockUsersModel.userPasswordCheck.mockResolvedValue(mockAuthCheck);

      const agent = request.agent(app);

      // Login
      await agent
        .post('/authenticate')
        .send({ username: 'testuser', password: 'password' })
        .expect(302);

      // Check if user is still authenticated in subsequent requests
      const response = await agent
        .get('/protected')
        .expect(200);

      expect(response.body.user).toMatchObject({
        userID: 1,
        username: 'testuser'
      });
    });
  });
});
