import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import linksRouter from '../../../server/routes/links';
import { Roles, DBUsers } from '../../../common/constants';
import { makeAuthCookie } from '../helpers/auth';

// Mock the database models
jest.mock('../../../server/sequelize/links-sequelize');

const mockLinksModel = require('../../../server/sequelize/links-sequelize');

describe('Links API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
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

      const response = await request(app)
        .put('/links/1')
        .set('Cookie', [makeAuthCookie({ userID: 3, username: 'owner', roleID: Roles.USER })])
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

      const response = await request(app)
        .put('/links/1')
        .set('Cookie', [makeAuthCookie({ userID: 2, username: 'admin', roleID: Roles.ADMIN })])
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updatedLink);
    });

    it('should return 403 if user does not own link and is not admin', async () => {
      const updateData = {
        url: 'http://updated.com',
        name: 'Updated Link',
        displayOrder: 1,
        userID: 3
      };

      await request(app)
        .put('/links/1')
        .set('Cookie', [makeAuthCookie({ userID: 4, username: 'other', roleID: Roles.USER })])
        .send(updateData)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .put('/links/1')
        .send({ url: 'http://updated.com', name: 'x', displayOrder: 1, userID: 3 })
        .expect(401);
    });
  });

  describe('POST /links', () => {
    it('should create link for authorized user', async () => {
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

      const response = await request(app)
        .post('/links')
        .set('Cookie', [makeAuthCookie({ userID: 3, username: 'owner', roleID: Roles.USER })])
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

      const response = await request(app)
        .post('/links')
        .set('Cookie', [makeAuthCookie({ userID: 2, username: 'admin', roleID: Roles.ADMIN })])
        .send(createData)
        .expect(200);

      expect(response.body).toMatchObject(newLink);
    });

    it('should return 403 if user tries to create link for another user', async () => {
      const createData = {
        url: 'http://new.com',
        name: 'New Link',
        displayOrder: 1,
        userID: 3
      };

      await request(app)
        .post('/links')
        .set('Cookie', [makeAuthCookie({ userID: 4, username: 'other', roleID: Roles.USER })])
        .send(createData)
        .expect(403);
    });
  });

  describe('DELETE /links/:linkid', () => {
    it('should delete link if user owns it', async () => {
      const deletedLink = { linkID: 1 };
      mockLinksModel.read.mockResolvedValue({ linkID: 1, userID: 3 });
      mockLinksModel.destroy.mockResolvedValue(deletedLink);

      const response = await request(app)
        .delete('/links/1')
        .set('Cookie', [makeAuthCookie({ userID: 3, username: 'owner', roleID: Roles.USER })])
        .send({ userID: 3 })
        .expect(200);

      expect(response.body).toMatchObject(deletedLink);
      expect(mockLinksModel.destroy).toHaveBeenCalledWith('1');
    });

    it('should return 403 when a non-owner, non-admin tries to delete (regression: was hardcoded to userID === 2)', async () => {
      mockLinksModel.read.mockResolvedValue({ linkID: 1, userID: 3 });

      // userID 2 used to bypass ownership entirely due to a hardcoded check; it must not anymore.
      await request(app)
        .delete('/links/1')
        .set('Cookie', [makeAuthCookie({ userID: 2, username: 'not-admin', roleID: Roles.USER })])
        .send({ userID: 3 })
        .expect(403);

      expect(mockLinksModel.destroy).not.toHaveBeenCalled();
    });

    it('should allow an admin to delete a link they do not own', async () => {
      mockLinksModel.read.mockResolvedValue({ linkID: 1, userID: 3 });
      mockLinksModel.destroy.mockResolvedValue({ linkID: 1 });

      await request(app)
        .delete('/links/1')
        .set('Cookie', [makeAuthCookie({ userID: 2, username: 'admin', roleID: Roles.ADMIN })])
        .send({ userID: 3 })
        .expect(200);
    });

    it('should return 404 when link not found', async () => {
      mockLinksModel.read.mockResolvedValue({ linkID: 999, userID: 3 });
      mockLinksModel.destroy.mockResolvedValue(null);

      await request(app)
        .delete('/links/999')
        .set('Cookie', [makeAuthCookie({ userID: 3, username: 'owner', roleID: Roles.USER })])
        .send({ userID: 3 })
        .expect(404);
    });
  });
});
