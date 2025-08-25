import request from 'supertest';
import express from 'express';
import userFeedsRouter from '../../../server/routes/user-feeds';
import { UserFeedModel } from '../../../common/models';

// Mock the database models
jest.mock('../../../server/sequelize/userfeeds-sequelize');
jest.mock('../../../server/sequelize/cached-newsitems-sequelize');
jest.mock('../../../server/sequelize/feedsources-sequelize');
jest.mock('../../../server/sequelize/pages-sequelize');

const mockUserFeedsModel = require('../../../server/sequelize/userfeeds-sequelize');
const mockCachedNewsItemsModel = require('../../../server/sequelize/cached-newsitems-sequelize');
const mockFeedSourcesModel = require('../../../server/sequelize/feedsources-sequelize');
const mockPagesModel = require('../../../server/sequelize/pages-sequelize');

describe('UserFeeds API Routes', () => {
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
    
    app.use('/userfeeds', userFeedsRouter);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /userfeeds/page/:pageid', () => {
    it('should return user feeds for a specific page', async () => {
      const mockUserFeeds = [
        {
          column: 1,
          row: 1,
          name: 'Test Feed 1',
          itemDisplayCount: 10,
          pageID: 1,
          feedSourceID: 1,
          userFeedID: 1
        },
        {
          column: 2,
          row: 1,
          name: 'Test Feed 2',
          itemDisplayCount: 5,
          pageID: 1,
          feedSourceID: 2,
          userFeedID: 2
        }
      ];

      const mockCachedNewsItems = [
        {
          title: 'News Item 1',
          link: 'https://example.com/news1',
          description: 'Description 1',
          feedSourceID: 1,
          cachedNewsItemID: 1
        }
      ];

      const mockFeedSources = [
        {
          url: 'https://example.com/feed1.rss',
          cachedTitle: 'Test Feed Source',
          cachedWebsiteURL: 'https://example.com',
          feedSourceID: 1
        }
      ];

      mockUserFeedsModel.getUserFeedsByPageID.mockResolvedValue(mockUserFeeds);
      mockUserFeedsModel.updateFeedSourceCachedNewsItemsIfNeeded.mockResolvedValue(true);
      mockCachedNewsItemsModel.getKeysForMultipleFeedSourceID.mockResolvedValue([1]);
      mockCachedNewsItemsModel.read.mockResolvedValue(mockCachedNewsItems[0]);
      mockFeedSourcesModel.read.mockResolvedValue(mockFeedSources[0]);

      const response = await request(app)
        .get('/userfeeds/page/1')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        column: 1,
        row: 1,
        name: 'Test Feed 1',
        itemDisplayCount: 10,
        pageID: 1,
        feedSourceID: 1,
        userFeedID: 1
      });
      expect(mockUserFeedsModel.getUserFeedsByPageID).toHaveBeenCalledWith(1);
    });

    it('should handle errors when fetching user feeds', async () => {
      mockUserFeedsModel.getUserFeedsByPageID.mockRejectedValue(new Error('Database error'));

      await request(app)
        .get('/userfeeds/page/1')
        .expect(500);
    });
  });

  describe('GET /userfeeds/:userfeedid', () => {
    it('should return a specific user feed', async () => {
      const mockUserFeed = {
        column: 1,
        row: 1,
        name: 'Test Feed',
        itemDisplayCount: 10,
        pageID: 1,
        feedSourceID: 1,
        userFeedID: 123
      };

      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue(mockUserFeed);

      const response = await request(app)
        .get('/userfeeds/123')
        .expect(200);

      expect(response.body).toMatchObject(mockUserFeed);
      expect(mockUserFeedsModel.readByUserFeedIDAsync).toHaveBeenCalledWith(123);
    });

    it('should return 404 when user feed not found', async () => {
      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue(null);

      await request(app)
        .get('/userfeeds/999')
        .expect(404);
    });
  });

  describe('PUT /userfeeds/:userfeedid', () => {
    it('should update an existing user feed', async () => {
      const existingUserFeed = {
        column: 1,
        row: 1,
        name: 'Old Name',
        itemDisplayCount: 5,
        pageID: 1,
        feedSourceID: 1,
        userFeedID: 123
      };

      const updatedUserFeed = {
        ...existingUserFeed,
        name: 'Updated Name',
        itemDisplayCount: 10
      };

      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue(existingUserFeed);
      mockUserFeedsModel.update.mockResolvedValue(updatedUserFeed);

      const updateData = {
        name: 'Updated Name',
        itemDisplayCount: 10,
        column: 1,
        row: 1,
        pageID: 1,
        feedSourceID: 1
      };

      const response = await request(app)
        .put('/userfeeds/123')
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.itemDisplayCount).toBe(10);
      expect(mockUserFeedsModel.update).toHaveBeenCalled();
    });

    it('should calculate new position when moving to different page', async () => {
      const existingUserFeed = {
        column: 1,
        row: 1,
        name: 'Test Feed',
        itemDisplayCount: 10,
        pageID: 1,
        feedSourceID: 1,
        userFeedID: 123
      };

      const targetPageUserFeeds = [
        new UserFeedModel(1, 1, 'Existing Feed 1', 10, 2, 1),
        new UserFeedModel(2, 1, 'Existing Feed 2', 10, 2, 2)
      ];

      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue(existingUserFeed);
      mockUserFeedsModel.getUserFeedsByPageID.mockResolvedValue(targetPageUserFeeds);
      mockUserFeedsModel.updateFeedSourceCachedNewsItemsIfNeeded.mockResolvedValue(true);
      mockUserFeedsModel.update.mockResolvedValue({
        ...existingUserFeed,
        pageID: 2,
        column: 3,
        row: 1
      });

      const updateData = {
        name: 'Test Feed',
        itemDisplayCount: 10,
        pageID: 2, // Moving to different page
        feedSourceID: 1
        // No column/row specified, should auto-calculate
      };

      const response = await request(app)
        .put('/userfeeds/123')
        .send(updateData)
        .expect(200);

      expect(mockUserFeedsModel.getUserFeedsByPageID).toHaveBeenCalledWith(2);
      expect(mockUserFeedsModel.update).toHaveBeenCalled();
    });

    it('should return 404 when user feed not found', async () => {
      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue(null);

      const updateData = {
        name: 'Updated Name',
        itemDisplayCount: 10,
        pageID: 1
      };

      await request(app)
        .put('/userfeeds/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('POST /userfeeds', () => {
    it('should create a new user feed with existing feed source', async () => {
      const existingFeedSource = {
        url: 'https://example.com/feed.rss',
        cachedTitle: 'Test Feed',
        cachedWebsiteURL: 'https://example.com',
        feedSourceID: 1
      };

      const newUserFeed = {
        column: 1,
        row: 1,
        name: 'New Feed',
        itemDisplayCount: 10,
        pageID: 1,
        feedSourceID: 1,
        userFeedID: 123,
        dataValues: {
          newsItems: []
        }
      };

      mockUserFeedsModel.getUserFeedsByPageID.mockResolvedValue([]);
      mockFeedSourcesModel.getByURL.mockResolvedValue(existingFeedSource);
      mockUserFeedsModel.updateFeedSourceCachedNewsItemsIfNeeded.mockResolvedValue(true);
      mockCachedNewsItemsModel.getKeysForMultipleFeedSourceID.mockResolvedValue([]);
      mockUserFeedsModel.create.mockResolvedValue(newUserFeed);
      mockPagesModel.keylist.mockResolvedValue([1]);

      const createData = {
        name: 'New Feed',
        itemDisplayCount: 10,
        pageID: 1,
        feedURL: 'https://example.com/feed.rss'
      };

      const response = await request(app)
        .post('/userfeeds')
        .send(createData)
        .expect(200);

      expect(response.body.name).toBe('New Feed');
      expect(response.body.itemDisplayCount).toBe(10);
      expect(response.body.column).toBe(1);
      expect(response.body.row).toBe(1);
      expect(mockUserFeedsModel.create).toHaveBeenCalled();
    });

    it('should create a new feed source if it does not exist', async () => {
      const newFeedSource = {
        url: 'https://newsite.com/feed.rss',
        cachedTitle: 'New Site',
        cachedWebsiteURL: 'https://newsite.com',
        feedSourceID: 2
      };

      const mockNewsItems = [
        {
          title: 'News Item',
          feedSourceWebTitle: 'New Site',
          feedSourceWebURL: 'https://newsite.com',
          feedSourceID: 2
        }
      ];

      mockUserFeedsModel.getUserFeedsByPageID.mockResolvedValue([]);
      mockFeedSourcesModel.getByURL.mockResolvedValue(undefined);
      mockUserFeedsModel.getNewsItemsFromFeedAsync.mockResolvedValue(mockNewsItems);
      mockFeedSourcesModel.create.mockResolvedValue(newFeedSource);
      mockUserFeedsModel.updateCachedNewsItemsAsync.mockResolvedValue(['success']);
      mockPagesModel.keylist.mockResolvedValue([1]);

      const createData = {
        name: 'New Feed from New Source',
        itemDisplayCount: 5,
        pageID: 1,
        feedURL: 'https://newsite.com/feed.rss'
      };

      // Mock the create method to return a proper response
      mockUserFeedsModel.create.mockResolvedValue({
        column: 1,
        row: 1,
        name: 'New Feed from New Source',
        itemDisplayCount: 5,
        pageID: 1,
        feedSourceID: 2,
        userFeedID: 124,
        dataValues: {
          newsItems: []
        }
      });

      const response = await request(app)
        .post('/userfeeds')
        .send(createData)
        .expect(200);

      expect(mockFeedSourcesModel.create).toHaveBeenCalled();
      expect(mockUserFeedsModel.updateCachedNewsItemsAsync).toHaveBeenCalled();
    });
  });

  describe('DELETE /userfeeds/:userfeedid', () => {
    it('should delete an existing user feed', async () => {
      const deletedUserFeed = {
        userFeedID: 123,
        name: 'Deleted Feed'
      };

      mockUserFeedsModel.destroyByUserFeedID.mockResolvedValue(deletedUserFeed);

      const response = await request(app)
        .delete('/userfeeds/123')
        .expect(200);

      expect(response.body).toMatchObject(deletedUserFeed);
      expect(mockUserFeedsModel.destroyByUserFeedID).toHaveBeenCalledWith(123);
    });

    it('should return 404 when user feed not found', async () => {
      mockUserFeedsModel.destroyByUserFeedID.mockResolvedValue(null);

      await request(app)
        .delete('/userfeeds/999')
        .expect(404);
    });
  });
});
