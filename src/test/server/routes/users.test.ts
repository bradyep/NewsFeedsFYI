import request from 'supertest';
import express from 'express';
import usersRouter from '../../../server/routes/users';
import { UserModel, PageModel } from '../../../common/models';

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
      expect(mockUsersModel.read).toHaveBeenCalledWith(1); // GUEST_ID
    });

    it('should redirect normal user to their profile', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 3 };
        next();
      });
      testApp.use('/users', usersRouter);

      await request(testApp)
        .get('/users')
        .expect(302)
        .expect('Location', '/users/3');
    });

    // Admin should just return itself like a normal user for now
    it('should redirect admin user to their profile', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 2 };
        next();
      });
      testApp.use('/users', usersRouter);

      await request(testApp)
        .get('/users')
        .expect(302)
        .expect('Location', '/users/2');
    });

    /*
    it('should return user list for admin user', async () => {
      const mockUserList = [
        { userID: 1, username: 'admin', email: 'admin@test.com' },
        { userID: 3, username: 'user1', email: 'user1@test.com' }
      ];

      const adminApp = express();
      adminApp.use(express.json());
      adminApp.use(express.urlencoded({ extended: true }));
      adminApp.use((req, res, next) => {
        req.user = { userID: 2 }; // ADMIN_ID = 2
        next();
      });
      adminApp.use('/users', usersRouter);

      mockUsersModel.keylist.mockResolvedValue([1, 3]);
      mockUsersModel.read.mockImplementation((id: number) => {
        const user = mockUserList.find(u => u.userID === id);
        return Promise.resolve(user);
      });

      const response = await request(adminApp)
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(mockUsersModel.keylist).toHaveBeenCalled();
    });
    */
  });

  describe('GET /users/:userid', () => {
    it('should return specific user data', async () => {
      const mockUser = new UserModel('testuser', 'password', 'test@test.com', 3, 1);
      mockUsersModel.read.mockResolvedValue(mockUser);

      const authApp = express();
      authApp.use(express.json());
      authApp.use(express.urlencoded({ extended: true }));
      authApp.use((req, res, next) => {
        req.user = { userID: 1 };
        next();
      });
      authApp.use('/users', usersRouter);

      const response = await request(authApp)
        .get('/users/1')
        .expect(200);

      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@test.com');
      expect(mockUsersModel.read).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user not found', async () => {
      mockUsersModel.read.mockResolvedValue(null);

      const authApp = express();
      authApp.use(express.json());
      authApp.use(express.urlencoded({ extended: true }));
      authApp.use((req, res, next) => {
        req.user = { userID: 1 };
        next();
      });
      authApp.use('/users', usersRouter);

      await request(authApp)
        .get('/users/999')
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
      expect(mockUsersModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          password: 'password123',
          email: 'new@test.com',
          roleID: 3
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
  });

  describe('PUT /users/:userid', () => {
    it('should update user data', async () => {
      const updatedUser = new UserModel('updateduser', 'newpassword', 'updated@test.com', 3, 1);
      mockUsersModel.update.mockResolvedValue(updatedUser);

      const updateData = {
        username: 'updateduser',
        password: 'newpassword',
        email: 'updated@test.com'
      };

      const authApp = express();
      authApp.use(express.json());
      authApp.use(express.urlencoded({ extended: true }));
      authApp.use((req, res, next) => {
        req.user = { userID: 1 };
        next();
      });
      authApp.use('/users', usersRouter);

      const response = await request(authApp)
        .put('/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body.username).toBe('updateduser');
      expect(mockUsersModel.update).toHaveBeenCalledWith(
        1,
        'updateduser',
        'newpassword',
        'updated@test.com'
      );
    });

    it('should return 404 when user not found', async () => {
      mockUsersModel.update.mockResolvedValue(null);

      const updateData = {
        username: 'updateduser',
        password: 'newpassword',
        email: 'updated@test.com'
      };

      const authApp = express();
      authApp.use(express.json());
      authApp.use(express.urlencoded({ extended: true }));
      authApp.use((req, res, next) => {
        req.user = { userID: 1 };
        next();
      });
      authApp.use('/users', usersRouter);

      await request(authApp)
        .put('/users/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /users/:userid', () => {
    it('should delete a user', async () => {
      const deletedUser = { userID: 1, username: 'deleteduser' };
      mockUsersModel.destroy.mockResolvedValue(deletedUser);

      const authApp = express();
      authApp.use(express.json());
      authApp.use(express.urlencoded({ extended: true }));
      authApp.use((req, res, next) => {
        req.user = { userID: 1 };
        next();
      });
      authApp.use('/users', usersRouter);

      const response = await request(authApp)
        .delete('/users/1')
        .expect(200);

      expect(response.body).toMatchObject(deletedUser);
      expect(mockUsersModel.destroy).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user not found', async () => {
      mockUsersModel.destroy.mockResolvedValue(null);

      const authApp = express();
      authApp.use(express.json());
      authApp.use(express.urlencoded({ extended: true }));
      authApp.use((req, res, next) => {
        req.user = { userID: 1 };
        next();
      });
      authApp.use('/users', usersRouter);

      await request(authApp)
        .delete('/users/999')
        .expect(404);
    });
  });
});
