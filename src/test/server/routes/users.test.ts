import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import usersRouter from '../../../server/routes/users';
import { UserModel, PageModel } from '../../../common/models';
import { Roles } from '../../../common/constants';
import { makeAuthCookie } from '../helpers/auth';

// Mock the database models
jest.mock('../../../server/sequelize/users-sequelize');
jest.mock('../../../server/sequelize/pages-sequelize');

const mockUsersModel = require('../../../server/sequelize/users-sequelize');
const mockPagesModel = require('../../../server/sequelize/pages-sequelize');

describe('Users API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use('/users', usersRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return guest user when no user is authenticated', async () => {
      const guestUser = new UserModel('guest', '', '', 1, 1);
      mockUsersModel.read.mockResolvedValue(guestUser);

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body.username).toBe('guest');
      expect(response.body.password).toBeUndefined();
      expect(mockUsersModel.read).toHaveBeenCalledWith(1); // GUEST_ID
    });

    it('should redirect normal user to their profile', async () => {
      await request(app)
        .get('/users')
        .set('Cookie', [makeAuthCookie({ userID: 3, username: 'normal', roleID: Roles.USER })])
        .expect(302)
        .expect('Location', '/users/3');
    });

    // Admin should just return itself like a normal user for now
    it('should redirect admin user to their profile', async () => {
      await request(app)
        .get('/users')
        .set('Cookie', [makeAuthCookie({ userID: 2, username: 'admin', roleID: Roles.ADMIN })])
        .expect(302)
        .expect('Location', '/users/2');
    });
  });

  describe('GET /users/:userid', () => {
    it('should return specific user data for the owning user', async () => {
      const mockUser = new UserModel('testuser', 'password', 'test@test.com', 3, 1);
      mockUsersModel.read.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/1')
        .set('Cookie', [makeAuthCookie({ userID: 1, username: 'testuser', roleID: Roles.USER })])
        .expect(200);

      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@test.com');
      expect(response.body.password).toBeUndefined();
      expect(mockUsersModel.read).toHaveBeenCalledWith(1);
    });

    it('should return 403 when a non-owner, non-admin requests another user', async () => {
      await request(app)
        .get('/users/2')
        .set('Cookie', [makeAuthCookie({ userID: 1, username: 'testuser', roleID: Roles.USER })])
        .expect(403);

      expect(mockUsersModel.read).not.toHaveBeenCalled();
    });

    it('should allow an admin to view another user', async () => {
      const mockUser = new UserModel('testuser', 'password', 'test@test.com', 3, 2);
      mockUsersModel.read.mockResolvedValue(mockUser);

      await request(app)
        .get('/users/2')
        .set('Cookie', [makeAuthCookie({ userID: 1, username: 'admin', roleID: Roles.ADMIN })])
        .expect(200);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/users/1')
        .expect(401);
    });

    it('should return 404 when user not found', async () => {
      mockUsersModel.read.mockResolvedValue(null);

      await request(app)
        .get('/users/999')
        .set('Cookie', [makeAuthCookie({ userID: 999, username: 'self', roleID: Roles.USER })])
        .expect(404);
    });
  });

  describe('POST /users', () => {
    it('should create a new user and initial page', async () => {
      const newUser = new UserModel('newuser', 'password123', 'new@test.com', 3, 123);
      const initialPage = new PageModel('My First Page', 1, 123, 1);

      mockUsersModel.create.mockResolvedValue(newUser);
      mockPagesModel.create.mockResolvedValue(initialPage);

      const createData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@test.com'
      };

      const response = await request(app)
        .post('/users')
        .send(createData)
        .expect(200);

      expect(response.body.username).toBe('newuser');
      expect(response.body.email).toBe('new@test.com');
      expect(response.body.password).toBeUndefined();
      expect(mockUsersModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          password: 'password123',
          email: 'new@test.com',
          roleID: Roles.USER
        })
      );
      expect(mockPagesModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My First Page',
          displayOrder: 1,
          userID: 123
        })
      );
    });

    it('should still return user even if page creation fails', async () => {
      const newUser = new UserModel('newuser', 'password123', 'new@test.com', 3, 123);

      mockUsersModel.create.mockResolvedValue(newUser);
      mockPagesModel.create.mockRejectedValue(new Error('Page creation failed'));

      const createData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@test.com'
      };

      const response = await request(app)
        .post('/users')
        .send(createData)
        .expect(200);

      expect(response.body.username).toBe('newuser');
      expect(mockUsersModel.create).toHaveBeenCalled();
    });

    it('should handle user creation errors', async () => {
      mockUsersModel.create.mockRejectedValue(new Error('Username already exists'));

      const createData = {
        username: 'existinguser',
        password: 'password123',
        email: 'existing@test.com'
      };

      await request(app)
        .post('/users')
        .send(createData)
        .expect(500);
    });

    it('should reject signup with a missing field', async () => {
      await request(app)
        .post('/users')
        .send({ username: 'newuser', password: 'password123' }) // no email
        .expect(400);

      expect(mockUsersModel.create).not.toHaveBeenCalled();
    });

    it('should reject signup with a too-short password', async () => {
      await request(app)
        .post('/users')
        .send({ username: 'newuser', password: 'short', email: 'new@test.com' })
        .expect(400);

      expect(mockUsersModel.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /users/:userid', () => {
    it('should update user data for the owning user', async () => {
      const updatedUser = new UserModel('updateduser', 'newpassword', 'updated@test.com', 3, 1);
      mockUsersModel.update.mockResolvedValue(updatedUser);

      const updateData = {
        username: 'updateduser',
        password: 'newpassword',
        email: 'updated@test.com'
      };

      const response = await request(app)
        .put('/users/1')
        .set('Cookie', [makeAuthCookie({ userID: 1, username: 'owner', roleID: Roles.USER })])
        .send(updateData)
        .expect(200);

      expect(response.body.username).toBe('updateduser');
      expect(response.body.password).toBeUndefined();
      expect(mockUsersModel.update).toHaveBeenCalledWith(
        1,
        'updateduser',
        'newpassword',
        'updated@test.com'
      );
    });

    it('should return 403 when a non-owner, non-admin tries to update another user', async () => {
      await request(app)
        .put('/users/2')
        .set('Cookie', [makeAuthCookie({ userID: 1, username: 'owner', roleID: Roles.USER })])
        .send({ username: 'x', password: 'y', email: 'z' })
        .expect(403);

      expect(mockUsersModel.update).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .put('/users/1')
        .send({ username: 'x', password: 'y', email: 'z' })
        .expect(401);
    });

    it('should return 404 when user not found', async () => {
      mockUsersModel.update.mockResolvedValue(null);

      const updateData = {
        username: 'updateduser',
        password: 'newpassword',
        email: 'updated@test.com'
      };

      await request(app)
        .put('/users/999')
        .set('Cookie', [makeAuthCookie({ userID: 999, username: 'self', roleID: Roles.USER })])
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /users/:userid', () => {
    it('should delete a user', async () => {
      const deletedUser = { userID: 1, username: 'deleteduser' };
      mockUsersModel.destroy.mockResolvedValue(deletedUser);

      const response = await request(app)
        .delete('/users/1')
        .set('Cookie', [makeAuthCookie({ userID: 1, username: 'owner', roleID: Roles.USER })])
        .expect(200);

      expect(response.body).toMatchObject(deletedUser);
      expect(mockUsersModel.destroy).toHaveBeenCalledWith(1);
    });

    it('should return 403 when a non-owner, non-admin tries to delete another user', async () => {
      await request(app)
        .delete('/users/2')
        .set('Cookie', [makeAuthCookie({ userID: 1, username: 'owner', roleID: Roles.USER })])
        .expect(403);

      expect(mockUsersModel.destroy).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockUsersModel.destroy.mockResolvedValue(null);

      await request(app)
        .delete('/users/999')
        .set('Cookie', [makeAuthCookie({ userID: 999, username: 'self', roleID: Roles.USER })])
        .expect(404);
    });
  });
});
