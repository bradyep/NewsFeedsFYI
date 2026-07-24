import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import userFeedsRouter from '../../../server/routes/user-feeds';
import { UserFeedModel } from '../../../common/models';
import { Roles } from '../../../common/constants';
import { makeAuthCookie } from '../helpers/auth';

// Mock the database models
jest.mock('../../../server/sequelize/userfeeds-sequelize');
jest.mock('../../../server/sequelize/cached-newsitems-sequelize');
jest.mock('../../../server/sequelize/feedsources-sequelize');
jest.mock('../../../server/sequelize/pages-sequelize');

const mockUserFeedsModel = require('../../../server/sequelize/userfeeds-sequelize');
const mockCachedNewsItemsModel = require('../../../server/sequelize/cached-newsitems-sequelize');
const mockFeedSourcesModel = require('../../../server/sequelize/feedsources-sequelize');
const mockPagesModel = require('../../../server/sequelize/pages-sequelize');

// Most of these tests exercise feature behavior (position calculation, feed-source lookup,
// etc.), not authorization boundaries, so they authenticate as an admin to bypass the
// per-resource ownership check without also having to mock the page lookup on every case.
// The dedicated "authorization" describe blocks below test ownership enforcement directly.
const adminCookie = makeAuthCookie({ userID: 1, username: 'admin', roleID: Roles.ADMIN });

describe('UserFeeds API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Mock authenticated user (used directly by the soft-auth GET routes)
    app.use((req, res, next) => {
      req.user = { userID: 1, roleID: Roles.ADMIN };
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
        .set('Cookie', [adminCookie])
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

      await request(app)
        .put('/userfeeds/123')
        .set('Cookie', [adminCookie])
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
        .set('Cookie', [adminCookie])
        .send(updateData)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .put('/userfeeds/123')
        .send({ name: 'x', itemDisplayCount: 1, pageID: 1 })
        .expect(401);
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

      const createData = {
        name: 'New Feed',
        itemDisplayCount: 10,
        pageID: 1,
        feedURL: 'https://example.com/feed.rss'
      };

      const response = await request(app)
        .post('/userfeeds')
        .set('Cookie', [adminCookie])
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

      const createData = {
        name: 'New Feed from New Source',
        itemDisplayCount: 5,
        pageID: 1,
        feedURL: 'https://newsite.com/feed.rss'
      };

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

      await request(app)
        .post('/userfeeds')
        .set('Cookie', [adminCookie])
        .send(createData)
        .expect(200);

      expect(mockFeedSourcesModel.create).toHaveBeenCalled();
      expect(mockUserFeedsModel.updateCachedNewsItemsAsync).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .post('/userfeeds')
        .send({ name: 'x', itemDisplayCount: 1, pageID: 1, feedURL: 'https://example.com/feed.rss' })
        .expect(401);
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
        .set('Cookie', [adminCookie])
        .expect(200);

      expect(response.body).toMatchObject(deletedUserFeed);
      expect(mockUserFeedsModel.destroyByUserFeedID).toHaveBeenCalledWith(123);
    });

    it('should return 404 when user feed not found', async () => {
      mockUserFeedsModel.destroyByUserFeedID.mockResolvedValue(null);

      await request(app)
        .delete('/userfeeds/999')
        .set('Cookie', [adminCookie])
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .delete('/userfeeds/123')
        .expect(401);
    });
  });

  // Regression tests for the fixed authorizeRequest bug: it used to run fire-and-forget
  // (missing `return` after calling next(err)), so the route body kept executing and
  // mutated data even when authorization failed. These assert the underlying model methods
  // are genuinely never reached when a non-owner, non-admin tries to mutate someone else's data.
  describe('authorization', () => {
    const nonOwnerCookie = makeAuthCookie({ userID: 6, username: 'intruder', roleID: Roles.USER });

    it('POST /userfeeds should 403 and not call create() when the requester does not own the target page', async () => {
      mockPagesModel.read.mockResolvedValue({ pageID: 1, userID: 5 }); // page owned by userID 5, not 6

      await request(app)
        .post('/userfeeds')
        .set('Cookie', [nonOwnerCookie])
        .send({ name: 'x', itemDisplayCount: 1, pageID: 1, feedURL: 'https://example.com/feed.rss' })
        .expect(403);

      expect(mockUserFeedsModel.create).not.toHaveBeenCalled();
    });

    it('PUT /userfeeds/:userfeedid should 403 and not call update() when the requester does not own the underlying page', async () => {
      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue({ userFeedID: 123, pageID: 1 });
      mockPagesModel.read.mockResolvedValue({ pageID: 1, userID: 5 }); // page owned by userID 5, not 6

      await request(app)
        .put('/userfeeds/123')
        .set('Cookie', [nonOwnerCookie])
        .send({ name: 'Hijacked', itemDisplayCount: 1, pageID: 1 })
        .expect(403);

      expect(mockUserFeedsModel.update).not.toHaveBeenCalled();
    });

    it('DELETE /userfeeds/:userfeedid should 403 and not call destroyByUserFeedID() when the requester does not own the underlying page', async () => {
      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue({ userFeedID: 123, pageID: 1 });
      mockPagesModel.read.mockResolvedValue({ pageID: 1, userID: 5 }); // page owned by userID 5, not 6

      await request(app)
        .delete('/userfeeds/123')
        .set('Cookie', [nonOwnerCookie])
        .expect(403);

      expect(mockUserFeedsModel.destroyByUserFeedID).not.toHaveBeenCalled();
    });

    it('PUT /userfeeds/:userfeedid should succeed for the actual owner', async () => {
      mockUserFeedsModel.readByUserFeedIDAsync.mockResolvedValue({ userFeedID: 123, pageID: 1 });
      mockPagesModel.read.mockResolvedValue({ pageID: 1, userID: 6 }); // owned by userID 6
      mockUserFeedsModel.update.mockResolvedValue({ userFeedID: 123, name: 'Updated' });

      await request(app)
        .put('/userfeeds/123')
        .set('Cookie', [nonOwnerCookie]) // userID 6 - now the actual owner
        .send({ name: 'Updated', itemDisplayCount: 1, pageID: 1 })
        .expect(200);

      expect(mockUserFeedsModel.update).toHaveBeenCalled();
    });
  });
});
