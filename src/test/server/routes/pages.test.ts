import request from 'supertest';
import express from 'express';
import pagesRouter from '../../../server/routes/pages';
import { PageModel } from '../../../common/models';

// Mock the database models
jest.mock('../../../server/sequelize/pages-sequelize');

const mockPagesModel = require('../../../server/sequelize/pages-sequelize');

describe('Pages API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Mock authenticated user
    app.use((req, res, next) => {
      req.user = { userID: 1 };
      next();
    });
    
    app.use('/pages', pagesRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /pages', () => {
    it('should return all pages for the authenticated user', async () => {
      const mockPages = [
        { pageID: 1, name: 'Page 1', displayOrder: 1, userID: 1 },
        { pageID: 2, name: 'Page 2', displayOrder: 2, userID: 1 }
      ];

      mockPagesModel.keylist.mockResolvedValue([1, 2]);
      mockPagesModel.read.mockImplementation((id: number) => {
        const page = mockPages.find(p => p.pageID === id);
        return Promise.resolve(page);
      });

      const response = await request(app)
        .get('/pages')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        name: 'Page 1',
        displayOrder: 1,
        userID: 1,
        pageID: 1
      });
      expect(mockPagesModel.keylist).toHaveBeenCalledWith(1);
    });

    it('should return pages for guest user when not authenticated', async () => {
      // Override the middleware for this test
      const guestApp = express();
      guestApp.use(express.json());
      guestApp.use('/pages', pagesRouter);

      const mockPages = [
        { pageID: 1, name: 'Guest Page', displayOrder: 1, userID: 1 }
      ];

      mockPagesModel.keylist.mockResolvedValue([1]);
      mockPagesModel.read.mockResolvedValue(mockPages[0]);

      const response = await request(guestApp)
        .get('/pages')
        .expect(200);

      expect(mockPagesModel.keylist).toHaveBeenCalledWith(1); // Default to userID 1 for guests
    });

    it('should handle errors when fetching pages', async () => {
      mockPagesModel.keylist.mockRejectedValue(new Error('Database error'));

      await request(app)
        .get('/pages')
        .expect(500);
    });
  });

  describe('GET /pages/:pageid', () => {
    it('should return a specific page owned by the user', async () => {
      const mockPage = {
        pageID: 1,
        name: 'Test Page',
        displayOrder: 1,
        userID: 1
      };

      mockPagesModel.read.mockResolvedValue(mockPage);

      const response = await request(app)
        .get('/pages/1')
        .expect(200);

      expect(response.body).toMatchObject(mockPage);
      expect(mockPagesModel.read).toHaveBeenCalledWith('1');
    });

    it('should return 403 when user tries to access page they do not own', async () => {
      const mockPage = {
        pageID: 1,
        name: 'Other User Page',
        displayOrder: 1,
        userID: 2 // Different user
      };

      mockPagesModel.read.mockResolvedValue(mockPage);

      await request(app)
        .get('/pages/1')
        .expect(403);
    });

    it('should allow admin (userID 2) to access any page', async () => {
      const adminApp = express();
      adminApp.use(express.json());
      adminApp.use((req, res, next) => {
        req.user = { userID: 2 }; // Admin user
        next();
      });
      adminApp.use('/pages', pagesRouter);

      const mockPage = {
        pageID: 1,
        name: 'Any User Page',
        displayOrder: 1,
        userID: 3 // Different user
      };

      mockPagesModel.read.mockResolvedValue(mockPage);

      const response = await request(adminApp)
        .get('/pages/1')
        .expect(200);

      expect(response.body).toMatchObject(mockPage);
    });

    it('should return 404 when page not found', async () => {
      mockPagesModel.read.mockResolvedValue(null);

      await request(app)
        .get('/pages/999')
        .expect(404);
    });
  });

  describe('PUT /pages/:pageid', () => {
    it('should update a page owned by the user', async () => {
      const updatedPage = {
        pageID: 1,
        name: 'Updated Page',
        displayOrder: 2,
        userID: 1
      };

      mockPagesModel.update.mockResolvedValue(updatedPage);

      const updateData = {
        name: 'Updated Page',
        displayOrder: 2,
        userID: 1
      };

      const response = await request(app)
        .put('/pages/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updatedPage);
      expect(mockPagesModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Page',
          displayOrder: 2,
          userID: 1,
          pageID: 1
        })
      );
    });

    it('should return 403 when user tries to update page they do not own', async () => {
      const updateData = {
        name: 'Updated Page',
        displayOrder: 2,
        userID: 2 // Different user
      };

      await request(app)
        .put('/pages/1')
        .send(updateData)
        .expect(403);
    });

    it('should allow admin to update any page', async () => {
      const adminApp = express();
      adminApp.use(express.json());
      adminApp.use((req, res, next) => {
        req.user = { userID: 2 }; // Admin user
        next();
      });
      adminApp.use('/pages', pagesRouter);

      const updatedPage = {
        pageID: 1,
        name: 'Admin Updated Page',
        displayOrder: 1,
        userID: 3
      };

      mockPagesModel.update.mockResolvedValue(updatedPage);

      const updateData = {
        name: 'Admin Updated Page',
        displayOrder: 1,
        userID: 3
      };

      const response = await request(adminApp)
        .put('/pages/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updatedPage);
    });

    it('should return 404 when page not found', async () => {
      mockPagesModel.update.mockResolvedValue(null);

      const updateData = {
        name: 'Updated Page',
        displayOrder: 2,
        userID: 1
      };

      await request(app)
        .put('/pages/1')
        .send(updateData)
        .expect(404);
    });
  });

  describe('POST /pages', () => {
    it('should create a new page for the authenticated user', async () => {
      const newPage = new PageModel('New Page', 3, 1, 123);

      mockPagesModel.create.mockResolvedValue(newPage);

      const createData = {
        name: 'New Page',
        displayOrder: 3,
        userID: 1
      };

      const response = await request(app)
        .post('/pages')
        .send(createData)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'New Page',
        displayOrder: 3,
        userID: 1
      });
      expect(mockPagesModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Page',
          displayOrder: 3,
          userID: 1
        })
      );
    });

    it('should return 403 when user tries to create page for different user', async () => {
      const createData = {
        name: 'New Page',
        displayOrder: 1,
        userID: 2 // Different user
      };

      await request(app)
        .post('/pages')
        .send(createData)
        .expect(403);
    });

    it('should allow admin to create page for any user', async () => {
      const adminApp = express();
      adminApp.use(express.json());
      adminApp.use((req, res, next) => {
        req.user = { userID: 2 }; // Admin user
        next();
      });
      adminApp.use('/pages', pagesRouter);

      const newPage = new PageModel('Admin Created Page', 1, 3, 124);

      mockPagesModel.create.mockResolvedValue(newPage);

      const createData = {
        name: 'Admin Created Page',
        displayOrder: 1,
        userID: 3
      };

      const response = await request(adminApp)
        .post('/pages')
        .send(createData)
        .expect(200);

      expect(mockPagesModel.create).toHaveBeenCalled();
    });

    it('should handle page creation errors', async () => {
      mockPagesModel.create.mockRejectedValue(new Error('Database error'));

      const createData = {
        name: 'New Page',
        displayOrder: 1,
        userID: 1
      };

      await request(app)
        .post('/pages')
        .send(createData)
        .expect(500);
    });
  });

  describe('DELETE /pages/:pageid', () => {
    it('should delete a page owned by the user', async () => {
      const deletedPage = { pageID: 1, name: 'Deleted Page' };

      mockPagesModel.destroy.mockResolvedValue(deletedPage);

      // Note: The route expects userID in request body for authorization
      const response = await request(app)
        .delete('/pages/1')
        .send({ userID: 1 })
        .expect(200);

      expect(response.body).toMatchObject(deletedPage);
      expect(mockPagesModel.destroy).toHaveBeenCalledWith('1');
    });

    it('should return 403 when user tries to delete page they do not own', async () => {
      await request(app)
        .delete('/pages/1')
        .send({ userID: 2 }) // Different user
        .expect(403);
    });

    it('should allow admin to delete any page', async () => {
      const adminApp = express();
      adminApp.use(express.json());
      adminApp.use((req, res, next) => {
        req.user = { userID: 2 }; // Admin user
        next();
      });
      adminApp.use('/pages', pagesRouter);

      const deletedPage = { pageID: 1, name: 'Admin Deleted Page' };

      mockPagesModel.destroy.mockResolvedValue(deletedPage);

      const response = await request(adminApp)
        .delete('/pages/1')
        .send({ userID: 3 })
        .expect(200);

      expect(response.body).toMatchObject(deletedPage);
    });

    it('should return 404 when page not found', async () => {
      mockPagesModel.destroy.mockResolvedValue(null);

      await request(app)
        .delete('/pages/1')
        .send({ userID: 1 })
        .expect(404);
    });
  });
});
