import { UserModel, PageModel, UserFeedModel } from '../../common/models';

export const mockUser: UserModel = new UserModel(
  'testuser',
  'password123',
  'test@example.com',
  3,
  1,
  new Date()
);

export const mockGuestUser: UserModel = new UserModel(
  'guest',
  '',
  '',
  1,
  2
);

export const mockPage: PageModel = new PageModel(
  'Test Page',
  1,
  1,
  1
);

export const mockUserFeed: UserFeedModel = new UserFeedModel(
  1,      // column
  1,      // row
  'Test Feed', // name
  10,     // itemDisplayCount
  1,      // pageID
  1,      // feedSourceID
  'http://example.com/feed.rss' // titleURL
);

export const createMockPages = (count: number = 3): PageModel[] => {
  return Array.from({ length: count }, (_, i) => 
    new PageModel(`Page ${i + 1}`, i + 1, 1, i + 1)
  );
};

export const createMockUserFeeds = (count: number = 5): UserFeedModel[] => {
  return Array.from({ length: count }, (_, i) => 
    new UserFeedModel(
      (i % 3) + 1,    // column 1-3
      i + 1,          // row
      `Feed ${i + 1}`, // name
      10,             // itemDisplayCount
      1,              // pageID
      i + 1,          // feedSourceID
      `http://example.com/feed${i + 1}.rss` // titleURL
    )
  );
};
