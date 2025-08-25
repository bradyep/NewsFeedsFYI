import request from 'supertest';
import express from 'express';
import linksRouter from '../../../server/routes/links';
import { Roles, DBUsers } from '../../../common/constants';

// Mock the database models
jest.mock('../../../server/sequelize/links-sequelize');

const mockLinksModel = require('../../../server/sequelize/links-sequelize');

describe('Links API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/links', linksRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /links', () => {
    it('should return user links for regular user', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 3, roleID: Roles.USER };
        next();
      });
      testApp.use('/links', linksRouter);

      mockLinksModel.keylist.mockResolvedValue([1, 2]);
      mockLinksModel.read.mockImplementation((id: number) => {
        return Promise.resolve({
          url: `http://example${id}.com`,
          name: `Link ${id}`,
          displayOrder: id,
          linkID: id,
          userID: 3
        });
      });

      const response = await request(testApp)
        .get('/links')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('url', 'http://example1.com');
      expect(response.body[1]).toHaveProperty('url', 'http://example2.com');
      expect(mockLinksModel.keylist).toHaveBeenCalledWith(3);
    });

    it('should return guest links for admin user', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 2, roleID: Roles.ADMIN };
        next();
      });
      testApp.use('/links', linksRouter);

      mockLinksModel.keylist.mockResolvedValue([1]);
      mockLinksModel.read.mockResolvedValue({
        url: 'http://guest.com',
        name: 'Guest Link',
        displayOrder: 1,
        linkID: 1,
        userID: DBUsers.GUEST
      });

      const response = await request(testApp)
        .get('/links')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('url', 'http://guest.com');
      expect(mockLinksModel.keylist).toHaveBeenCalledWith(DBUsers.GUEST);
    });

    it('should return guest links when no user is authenticated', async () => {
      mockLinksModel.keylist.mockResolvedValue([1]);
      mockLinksModel.read.mockResolvedValue({
        url: 'http://guest.com',
        name: 'Guest Link',
        displayOrder: 1,
        linkID: 1,
        userID: DBUsers.GUEST
      });

      const response = await request(app)
        .get('/links')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(mockLinksModel.keylist).toHaveBeenCalledWith(DBUsers.GUEST);
    });
  });

  describe('PUT /links/:linkid', () => {
    it('should update link if user owns it', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 3, roleID: Roles.USER };
        next();
      });
      testApp.use('/links', linksRouter);

      const updatedLink = {
        url: 'http://updated.com',
        name: 'Updated Link',
        displayOrder: 1,
        linkID: 1,
        userID: 3
      };

      mockLinksModel.update.mockResolvedValue(updatedLink);

      const updateData = {
        url: 'http://updated.com',
        name: 'Updated Link',
        displayOrder: 1,
        userID: 3
      };

      const response = await request(testApp)
        .put('/links/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updatedLink);
      expect(mockLinksModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://updated.com',
          name: 'Updated Link',
          displayOrder: 1,
          linkID: 1,
          userID: 3
        })
      );
    });

    it('should update link if user is admin', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 2, roleID: Roles.ADMIN };
        next();
      });
      testApp.use('/links', linksRouter);

      const updatedLink = {
        url: 'http://updated.com',
        name: 'Updated Link',
        displayOrder: 1,
        linkID: 1,
        userID: 3
      };

      mockLinksModel.update.mockResolvedValue(updatedLink);

      const updateData = {
        url: 'http://updated.com',
        name: 'Updated Link',
        displayOrder: 1,
        userID: 3
      };

      const response = await request(testApp)
        .put('/links/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updatedLink);
    });

    it('should return 403 if user does not own link and is not admin', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 4, roleID: Roles.USER };
        next();
      });
      testApp.use('/links', linksRouter);

      const updateData = {
        url: 'http://updated.com',
        name: 'Updated Link',
        displayOrder: 1,
        userID: 3
      };

      await request(testApp)
        .put('/links/1')
        .send(updateData)
        .expect(403);
    });
  });

  describe('POST /links', () => {
    it('should create link for authorized user', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 3, roleID: Roles.USER };
        next();
      });
      testApp.use('/links', linksRouter);

      const newLink = {
        url: 'http://new.com',
        name: 'New Link',
        displayOrder: 1,
        linkID: 5,
        userID: 3
      };

      mockLinksModel.create.mockResolvedValue(newLink);

      const createData = {
        url: 'http://new.com',
        name: 'New Link',
        displayOrder: 1,
        userID: 3
      };

      const response = await request(testApp)
        .post('/links')
        .send(createData)
        .expect(200);

      expect(response.body).toMatchObject(newLink);
      expect(mockLinksModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://new.com',
          name: 'New Link',
          displayOrder: 1,
          userID: 3
        })
      );
    });

    it('should allow admin to create link for other user', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 2, roleID: Roles.ADMIN };
        next();
      });
      testApp.use('/links', linksRouter);

      const newLink = {
        url: 'http://new.com',
        name: 'New Link',
        displayOrder: 1,
        linkID: 5,
        userID: 3
      };

      mockLinksModel.create.mockResolvedValue(newLink);

      const createData = {
        url: 'http://new.com',
        name: 'New Link',
        displayOrder: 1,
        userID: 3
      };

      const response = await request(testApp)
        .post('/links')
        .send(createData)
        .expect(200);

      expect(response.body).toMatchObject(newLink);
    });

    it('should return 403 if user tries to create link for another user', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 4, roleID: Roles.USER };
        next();
      });
      testApp.use('/links', linksRouter);

      const createData = {
        url: 'http://new.com',
        name: 'New Link',
        displayOrder: 1,
        userID: 3
      };

      await request(testApp)
        .post('/links')
        .send(createData)
        .expect(403);
    });
  });

  describe('DELETE /links/:linkid', () => {
    it('should delete link if user owns it', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 3, roleID: Roles.USER };
        next();
      });
      testApp.use('/links', linksRouter);

      const deletedLink = { linkID: 1 };
      mockLinksModel.destroy.mockResolvedValue(deletedLink);

      const response = await request(testApp)
        .delete('/links/1')
        .send({ userID: 3 })
        .expect(200);

      expect(response.body).toMatchObject(deletedLink);
      expect(mockLinksModel.destroy).toHaveBeenCalledWith('1');
    });

    it('should return 404 when link not found', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use((req, res, next) => {
        req.user = { userID: 3, roleID: Roles.USER };
        next();
      });
      testApp.use('/links', linksRouter);

      mockLinksModel.destroy.mockResolvedValue(null);

      await request(testApp)
        .delete('/links/999')
        .send({ userID: 3 })
        .expect(404);
    });
  });
});
