import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { router as authRouter } from '../../../server/routes/authenticate';
import { ensureAuthenticated } from '../../../server/middleware/authenticate-jwt';
import { JWT_COOKIE_NAME } from '../../../server/constants/auth-config';

// Mock the database models
jest.mock('../../../server/sequelize/users-sequelize');

const mockUsersModel = require('../../../server/sequelize/users-sequelize');

describe('Authentication Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use('/authenticate', authRouter);

    // Test route to check authentication via the JWT cookie
    app.get('/protected', ensureAuthenticated, (req, res) => {
      res.json({ message: 'Access granted', user: req.user });
    });

    jest.clearAllMocks();
  });

  describe('POST /authenticate', () => {
    it('should authenticate user with valid credentials and set the JWT cookie', async () => {
      mockUsersModel.userPasswordCheck.mockResolvedValue({
        check: true, userid: 1, username: 'testuser', roleid: 3
      });

      const response = await request(app)
        .post('/authenticate')
        .send({ username: 'testuser', password: 'correctpassword' })
        .expect(200);

      expect(response.body).toMatchObject({ userID: 1, username: 'testuser', roleID: 3 });
      const setCookie = response.headers['set-cookie'] as unknown as string[];
      expect(setCookie.some(c => c.startsWith(`${JWT_COOKIE_NAME}=`))).toBe(true);
      expect(mockUsersModel.userPasswordCheck).toHaveBeenCalledWith('testuser', 'correctpassword');
    });

    it('should reject user with invalid credentials and not set a cookie', async () => {
      mockUsersModel.userPasswordCheck.mockResolvedValue({
        check: false, userid: 0, username: 'testuser', message: 'Incorrect password'
      });

      const response = await request(app)
        .post('/authenticate')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401);

      expect(response.headers['set-cookie']).toBeUndefined();
      expect(mockUsersModel.userPasswordCheck).toHaveBeenCalledWith('testuser', 'wrongpassword');
    });

    it('should reject a request missing username or password', async () => {
      await request(app)
        .post('/authenticate')
        .send({ username: 'testuser' })
        .expect(400);

      expect(mockUsersModel.userPasswordCheck).not.toHaveBeenCalled();
    });

    it('should handle database errors during authentication', async () => {
      mockUsersModel.userPasswordCheck.mockRejectedValue(new Error('Database connection failed'));

      await request(app)
        .post('/authenticate')
        .send({ username: 'testuser', password: 'password' })
        .expect(500);
    });
  });

  describe('POST /authenticate/logout', () => {
    it('should clear the JWT cookie', async () => {
      const response = await request(app)
        .post('/authenticate/logout')
        .expect(200);

      const setCookie = response.headers['set-cookie'] as unknown as string[];
      const tokenCookie = setCookie.find(c => c.startsWith(`${JWT_COOKIE_NAME}=`));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
    });
  });

  describe('ensureAuthenticated middleware', () => {
    it('should allow access to protected routes when a valid session cookie is present', async () => {
      mockUsersModel.userPasswordCheck.mockResolvedValue({
        check: true, userid: 1, username: 'testuser', roleid: 3
      });

      const agent = request.agent(app);

      await agent
        .post('/authenticate')
        .send({ username: 'testuser', password: 'password' })
        .expect(200);

      const response = await agent
        .get('/protected')
        .expect(200);

      expect(response.body.message).toBe('Access granted');
      expect(response.body.user).toMatchObject({ userID: 1, username: 'testuser', roleID: 3 });
    });

    it('should reject unauthenticated users with 401', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.message).toBe('Not authenticated');
    });

    it('should reject a tampered cookie with 401', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Cookie', [`${JWT_COOKIE_NAME}=not-a-valid-jwt`])
        .expect(401);

      expect(response.body.message).toBe('Invalid or expired session');
    });
  });
});
