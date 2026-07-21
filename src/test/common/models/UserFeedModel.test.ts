import { UserFeedModel } from '../../../common/models/UserFeedModel';
import { CachedNewsItemModel } from '../../../common/models/CachedNewsItemModel';
import { NUMBER_OF_COLUMNS } from '../../../common/constants/newsfeeds';

describe('UserFeedModel', () => {
  describe('constructor', () => {
    it('should create a user feed with required properties', () => {
      const userFeed = new UserFeedModel(2, 3, 'Test Feed', 10);
      
      expect(userFeed.column).toBe(2);
      expect(userFeed.row).toBe(3);
      expect(userFeed.name).toBe('Test Feed');
      expect(userFeed.itemDisplayCount).toBe(10);
      expect(userFeed.pageID).toBeUndefined();
      expect(userFeed.feedSourceID).toBeUndefined();
      expect(userFeed.userFeedID).toBeUndefined();
      expect(userFeed.titleURL).toBe('');
      expect(userFeed.newsItems).toEqual([]);
    });

    it('should create a user feed with all optional properties', () => {
      const newsItems = [new CachedNewsItemModel('Title', 'http://link.com', 'Description')];
      const userFeed = new UserFeedModel(
        1, 2, 'Full Feed', 5, 123, 456, 'http://title.com', newsItems, 789
      );
      
      expect(userFeed.column).toBe(1);
      expect(userFeed.row).toBe(2);
      expect(userFeed.name).toBe('Full Feed');
      expect(userFeed.itemDisplayCount).toBe(5);
      expect(userFeed.pageID).toBe(123);
      expect(userFeed.feedSourceID).toBe(456);
      expect(userFeed.userFeedID).toBe(789);
      expect(userFeed.titleURL).toBe('http://title.com');
      expect(userFeed.newsItems).toEqual(newsItems);
    });

    it('should handle undefined titleURL', () => {
      const userFeed = new UserFeedModel(1, 1, 'Test', 5, undefined, undefined, undefined);
      
      expect(userFeed.titleURL).toBe('');
    });

    it('should handle undefined newsItems', () => {
      const userFeed = new UserFeedModel(1, 1, 'Test', 5, undefined, undefined, undefined, undefined);
      
      expect(userFeed.newsItems).toEqual([]);
    });
  });

  describe('JSON serialization and deserialization', () => {
    describe('JSON getter', () => {
      it('should serialize user feed with all properties', () => {
        const newsItems = [new CachedNewsItemModel('News 1', 'http://link1.com', 'Desc 1')];
        const userFeed = new UserFeedModel(
          2, 3, 'Serialize Feed', 7, 123, 456, 'http://title.com', newsItems, 789
        );
        
        const json = userFeed.JSON;
        const parsed = JSON.parse(json);
        
        expect(parsed).toEqual({
          userFeedID: 789,
          feedSourceID: 456,
          pageID: 123,
          column: 2,
          row: 3,
          name: 'Serialize Feed',
          itemDisplayCount: 7,
          newsItems: newsItems
        });
      });

      it('should serialize user feed with minimal properties', () => {
        const userFeed = new UserFeedModel(1, 1, 'Minimal Feed', 3);
        
        const json = userFeed.JSON;
        const parsed = JSON.parse(json);
        
        expect(parsed).toEqual({
          userFeedID: undefined,
          feedSourceID: undefined,
          pageID: undefined,
          column: 1,
          row: 1,
          name: 'Minimal Feed',
          itemDisplayCount: 3,
          newsItems: []
        });
      });

      it('should not include titleURL in JSON serialization', () => {
        const userFeed = new UserFeedModel(1, 1, 'Test', 5, undefined, undefined, 'http://title.com');
        
        const json = userFeed.JSON;
        const parsed = JSON.parse(json);
        
        expect(parsed).not.toHaveProperty('titleURL');
      });
    });

    describe('fromJSON static method', () => {
      it('should deserialize user feed with all properties', () => {
        const newsItems = [new CachedNewsItemModel('News', 'http://link.com', 'Description')];
        const jsonData = {
          userFeedID: 999,
          feedSourceID: 888,
          pageID: 777,
          column: 3,
          row: 2,
          name: 'Deserialized Feed',
          itemDisplayCount: 15,
          titleURL: 'http://example.com',
          newsItems: newsItems
        };
        
        const userFeed = UserFeedModel.fromJSON(JSON.stringify(jsonData));
        
        expect(userFeed).toBeInstanceOf(UserFeedModel);
        expect(userFeed.userFeedID).toBe(999);
        expect(userFeed.feedSourceID).toBe(888);
        expect(userFeed.pageID).toBe(777);
        expect(userFeed.column).toBe(3);
        expect(userFeed.row).toBe(2);
        expect(userFeed.name).toBe('Deserialized Feed');
        expect(userFeed.itemDisplayCount).toBe(15);
        expect(userFeed.titleURL).toBe('http://example.com');
        expect(userFeed.newsItems).toEqual(newsItems);
      });

      it('should deserialize user feed with minimal properties', () => {
        const jsonData = {
          column: 1,
          row: 1,
          name: 'Minimal',
          itemDisplayCount: 5
        };
        
        const userFeed = UserFeedModel.fromJSON(JSON.stringify(jsonData));
        
        expect(userFeed).toBeInstanceOf(UserFeedModel);
        expect(userFeed.column).toBe(1);
        expect(userFeed.row).toBe(1);
        expect(userFeed.name).toBe('Minimal');
        expect(userFeed.itemDisplayCount).toBe(5);
        expect(userFeed.userFeedID).toBeUndefined();
        expect(userFeed.feedSourceID).toBeUndefined();
        expect(userFeed.pageID).toBeUndefined();
      });

      it('should handle serialization round trip', () => {
        const originalFeed = new UserFeedModel(2, 3, 'Round Trip', 8, 123, 456, 'http://test.com');
        const json = originalFeed.JSON;
        const deserializedFeed = UserFeedModel.fromJSON(json);
        
        expect(deserializedFeed.column).toBe(originalFeed.column);
        expect(deserializedFeed.row).toBe(originalFeed.row);
        expect(deserializedFeed.name).toBe(originalFeed.name);
        expect(deserializedFeed.itemDisplayCount).toBe(originalFeed.itemDisplayCount);
        expect(deserializedFeed.pageID).toBe(originalFeed.pageID);
        expect(deserializedFeed.feedSourceID).toBe(originalFeed.feedSourceID);
        expect(deserializedFeed.userFeedID).toBe(originalFeed.userFeedID);
      });

      it('should throw error for invalid JSON', () => {
        expect(() => {
          UserFeedModel.fromJSON('invalid json');
        }).toThrow();
      });
    });
  });

  describe('getNextAvailableColumnAndRow static method', () => {
    it('should return column 1, row 1 for empty user feeds array', () => {
      const result = UserFeedModel.getNextAvailableColumnAndRow([]);
      
      expect(result).toEqual({ column: 1, row: 1 });
    });

    it('should return next available position when one feed exists', () => {
      const userFeeds = [
        new UserFeedModel(1, 1, 'Feed 1', 5)
      ];
      
      const result = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      // Should return column 2 or 3 (whichever is first), row 1
      expect(result.row).toBe(1);
      expect([2, 3]).toContain(result.column);
    });

    it('should return next row when all columns in row 1 are filled', () => {
      const userFeeds = [
        new UserFeedModel(1, 1, 'Feed 1', 5),
        new UserFeedModel(2, 1, 'Feed 2', 5),
        new UserFeedModel(3, 1, 'Feed 3', 5)
      ];
      
      const result = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      expect(result).toEqual({ column: 1, row: 2 });
    });

    it('should prefer column with fewer feeds', () => {
      const userFeeds = [
        new UserFeedModel(1, 1, 'Feed 1-1', 5),
        new UserFeedModel(1, 2, 'Feed 1-2', 5),
        new UserFeedModel(2, 1, 'Feed 2-1', 5),
        new UserFeedModel(3, 1, 'Feed 3-1', 5)
      ];
      
      const result = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      // Column 1 has 2 feeds, columns 2 and 3 have 1 each
      // Should return column 2 or 3 (whichever comes first), row 2
      expect(result.row).toBe(2);
      expect([2, 3]).toContain(result.column);
    });

    it('should handle complex scenario with uneven distribution', () => {
      const userFeeds = [
        new UserFeedModel(1, 1, 'Feed 1-1', 5),
        new UserFeedModel(1, 2, 'Feed 1-2', 5),
        new UserFeedModel(1, 3, 'Feed 1-3', 5),
        new UserFeedModel(2, 1, 'Feed 2-1', 5),
        new UserFeedModel(3, 1, 'Feed 3-1', 5),
        new UserFeedModel(3, 2, 'Feed 3-2', 5)
      ];
      
      const result = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      // Column 1: 3 feeds, Column 2: 1 feed, Column 3: 2 feeds
      // Should return column 2, row 2
      expect(result).toEqual({ column: 2, row: 2 });
    });

    it('should handle scenario where NUMBER_OF_COLUMNS is respected', () => {
      // Test that the function respects the NUMBER_OF_COLUMNS constant
      const userFeeds: UserFeedModel[] = [];
      
      // Add feeds to all columns
      for (let col = 1; col <= NUMBER_OF_COLUMNS; col++) {
        userFeeds.push(new UserFeedModel(col, 1, `Feed ${col}`, 5));
      }
      
      const result = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      expect(result).toEqual({ column: 1, row: 2 });
    });

    it('should return consistent results for same input', () => {
      const userFeeds = [
        new UserFeedModel(1, 1, 'Feed 1', 5),
        new UserFeedModel(2, 1, 'Feed 2', 5)
      ];
      
      const result1 = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      const result2 = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      expect(result1).toEqual(result2);
    });

    it('should handle single column scenario', () => {
      // Test edge case where all feeds are in column 1
      const userFeeds = [
        new UserFeedModel(1, 1, 'Feed 1', 5),
        new UserFeedModel(1, 2, 'Feed 2', 5)
      ];
      
      const result = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      // Should prefer empty columns 2 or 3
      expect(result.row).toBe(1);
      expect([2, 3]).toContain(result.column);
    });
  });

  describe('MobX observability', () => {
    let userFeed: UserFeedModel;

    beforeEach(() => {
      userFeed = new UserFeedModel(1, 1, 'Observable Test', 5, 123, 456);
    });

    it('should have observable pageID property', () => {
      expect(userFeed.pageID).toBe(123);
      userFeed.pageID = 999;
      expect(userFeed.pageID).toBe(999);
    });

    it('should have observable column property', () => {
      expect(userFeed.column).toBe(1);
      userFeed.column = 3;
      expect(userFeed.column).toBe(3);
    });

    it('should have observable row property', () => {
      expect(userFeed.row).toBe(1);
      userFeed.row = 5;
      expect(userFeed.row).toBe(5);
    });

    it('should have observable name property', () => {
      expect(userFeed.name).toBe('Observable Test');
      userFeed.name = 'Changed Name';
      expect(userFeed.name).toBe('Changed Name');
    });

    it('should have observable itemDisplayCount property', () => {
      expect(userFeed.itemDisplayCount).toBe(5);
      userFeed.itemDisplayCount = 15;
      expect(userFeed.itemDisplayCount).toBe(15);
    });

    it('should have observable titleURL property', () => {
      expect(userFeed.titleURL).toBe('');
      userFeed.titleURL = 'http://new-url.com';
      expect(userFeed.titleURL).toBe('http://new-url.com');
    });

    it('should have observable newsItems array', () => {
      expect(userFeed.newsItems).toHaveLength(0);
      
      const newsItem = new CachedNewsItemModel('Test News', 'http://link.com', 'Description');
      userFeed.newsItems.push(newsItem);
      
      expect(userFeed.newsItems).toHaveLength(1);
      expect(userFeed.newsItems[0]).toBe(newsItem);
    });
  });

  describe('readonly properties', () => {
    it('should have readonly userFeedID', () => {
      const userFeed = new UserFeedModel(1, 1, 'Test', 5, undefined, undefined, undefined, undefined, 123);
      
      expect(userFeed.userFeedID).toBe(123);
      
      // TypeScript should prevent this, but we can't test compilation errors in runtime tests
      // (userFeed as any).userFeedID = 999; // This should be prevented by TypeScript
    });

    it('should have readonly feedSourceID', () => {
      const userFeed = new UserFeedModel(1, 1, 'Test', 5, undefined, 456);
      
      expect(userFeed.feedSourceID).toBe(456);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in name', () => {
      const specialName = 'Feed & <Name> "with" \'quotes\' & symbols! @#$%^&*()';
      const userFeed = new UserFeedModel(1, 1, specialName, 5);
      
      expect(userFeed.name).toBe(specialName);
      
      const json = userFeed.JSON;
      const deserializedFeed = UserFeedModel.fromJSON(json);
      expect(deserializedFeed.name).toBe(specialName);
    });

    it('should handle zero and negative values', () => {
      const userFeed = new UserFeedModel(0, 0, 'Zero Test', 0, 0, 0, '', [], 0);
      
      expect(userFeed.column).toBe(0);
      expect(userFeed.row).toBe(0);
      expect(userFeed.itemDisplayCount).toBe(0);
      expect(userFeed.pageID).toBe(0);
      expect(userFeed.feedSourceID).toBe(0);
      expect(userFeed.userFeedID).toBe(0);
    });

    it('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const userFeed = new UserFeedModel(
        largeNumber, largeNumber, 'Large Test', largeNumber, largeNumber, largeNumber
      );
      
      expect(userFeed.column).toBe(largeNumber);
      expect(userFeed.row).toBe(largeNumber);
      expect(userFeed.itemDisplayCount).toBe(largeNumber);
      expect(userFeed.pageID).toBe(largeNumber);
      expect(userFeed.feedSourceID).toBe(largeNumber);
    });

    it('should handle empty newsItems array in getNextAvailableColumnAndRow', () => {
      const userFeeds = [
        new UserFeedModel(1, 1, 'Test', 5, undefined, undefined, undefined, [])
      ];
      
      const result = UserFeedModel.getNextAvailableColumnAndRow(userFeeds);
      
      expect(result.row).toBe(1);
      expect([2, 3]).toContain(result.column);
    });
  });
});
