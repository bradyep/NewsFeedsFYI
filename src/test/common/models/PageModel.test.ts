import { PageModel } from '../../../common/models/PageModel';
import { UserFeedModel } from '../../../common/models/UserFeedModel';
import { CachedNewsItemModel } from '../../../common/models/CachedNewsItemModel';

describe('PageModel', () => {
  describe('constructor', () => {
    it('should create a page with all required properties', () => {
      const page = new PageModel('Test Page', 1, 123, 456);
      
      expect(page.name).toBe('Test Page');
      expect(page.displayOrder).toBe(1);
      expect(page.userID).toBe(123);
      expect(page.pageID).toBe(456);
      expect(page.userFeeds).toEqual([]);
    });

    it('should create a page without pageID when not provided', () => {
      const page = new PageModel('Test Page', 2, 789);
      
      expect(page.name).toBe('Test Page');
      expect(page.displayOrder).toBe(2);
      expect(page.userID).toBe(789);
      expect(page.pageID).toBeUndefined();
      expect(page.userFeeds).toEqual([]);
    });

    it('should initialize userFeeds as empty array', () => {
      const page = new PageModel('Empty Page', 0, 1);
      
      expect(Array.isArray(page.userFeeds)).toBe(true);
      expect(page.userFeeds).toHaveLength(0);
    });
  });

  describe('addUserFeed', () => {
    let page: PageModel;
    let userFeed: UserFeedModel;

    beforeEach(() => {
      page = new PageModel('Test Page', 1, 123);
      userFeed = new UserFeedModel(1, 1, 'Test Feed', 5, 123, 456);
    });

    it('should add a user feed to the page', () => {
      page.addUserFeed(userFeed);
      
      expect(page.userFeeds).toHaveLength(1);
      expect(page.userFeeds[0]).toBe(userFeed);
    });

    it('should add multiple user feeds to the page', () => {
      const userFeed2 = new UserFeedModel(2, 1, 'Test Feed 2', 10, 123, 789);
      
      page.addUserFeed(userFeed);
      page.addUserFeed(userFeed2);
      
      expect(page.userFeeds).toHaveLength(2);
      expect(page.userFeeds[0]).toBe(userFeed);
      expect(page.userFeeds[1]).toBe(userFeed2);
    });

    it('should maintain order when adding user feeds', () => {
      const userFeed2 = new UserFeedModel(2, 1, 'Second Feed', 3, 123, 789);
      const userFeed3 = new UserFeedModel(3, 1, 'Third Feed', 7, 123, 101);
      
      page.addUserFeed(userFeed);
      page.addUserFeed(userFeed2);
      page.addUserFeed(userFeed3);
      
      expect(page.userFeeds).toHaveLength(3);
      expect(page.userFeeds[0].name).toBe('Test Feed');
      expect(page.userFeeds[1].name).toBe('Second Feed');
      expect(page.userFeeds[2].name).toBe('Third Feed');
    });
  });

  describe('JSON serialization and deserialization', () => {
    describe('JSON getter', () => {
      it('should serialize page with all properties', () => {
        const page = new PageModel('Serialize Page', 5, 987, 654);
        const json = page.JSON;
        const parsed = JSON.parse(json);
        
        expect(parsed).toEqual({
          pageID: 654,
          userID: 987,
          name: 'Serialize Page',
          displayOrder: 5
        });
      });

      it('should serialize page without pageID', () => {
        const page = new PageModel('No ID Page', 3, 555);
        const json = page.JSON;
        const parsed = JSON.parse(json);
        
        expect(parsed).toEqual({
          pageID: undefined,
          userID: 555,
          name: 'No ID Page',
          displayOrder: 3
        });
      });

      it('should not include userFeeds in JSON serialization', () => {
        const page = new PageModel('Page With Feeds', 1, 123, 456);
        const userFeed = new UserFeedModel(1, 1, 'Test Feed', 5);
        page.addUserFeed(userFeed);
        
        const json = page.JSON;
        const parsed = JSON.parse(json);
        
        expect(parsed).not.toHaveProperty('userFeeds');
        expect(Object.keys(parsed)).toEqual(['pageID', 'userID', 'name', 'displayOrder']);
      });
    });

    describe('fromJSON static method', () => {
      it('should deserialize page with all properties', () => {
        const jsonData = {
          pageID: 789,
          userID: 456,
          name: 'Deserialized Page',
          displayOrder: 2
        };
        
        const page = PageModel.fromJSON(JSON.stringify(jsonData));
        
        expect(page).toBeInstanceOf(PageModel);
        expect(page.pageID).toBe(789);
        expect(page.userID).toBe(456);
        expect(page.name).toBe('Deserialized Page');
        expect(page.displayOrder).toBe(2);
        expect(page.userFeeds).toEqual([]);
      });

      it('should deserialize page without pageID', () => {
        const jsonData = {
          userID: 123,
          name: 'No ID Deserialized',
          displayOrder: 1
        };
        
        const page = PageModel.fromJSON(JSON.stringify(jsonData));
        
        expect(page).toBeInstanceOf(PageModel);
        expect(page.pageID).toBeUndefined();
        expect(page.userID).toBe(123);
        expect(page.name).toBe('No ID Deserialized');
        expect(page.displayOrder).toBe(1);
      });

      it('should handle serialization round trip', () => {
        const originalPage = new PageModel('Round Trip', 7, 888, 999);
        const json = originalPage.JSON;
        const deserializedPage = PageModel.fromJSON(json);
        
        expect(deserializedPage.pageID).toBe(originalPage.pageID);
        expect(deserializedPage.userID).toBe(originalPage.userID);
        expect(deserializedPage.name).toBe(originalPage.name);
        expect(deserializedPage.displayOrder).toBe(originalPage.displayOrder);
        expect(deserializedPage.userFeeds).toEqual([]);
      });

      it('should throw error for invalid JSON', () => {
        expect(() => {
          PageModel.fromJSON('invalid json');
        }).toThrow();
      });

      it('should handle JSON with missing properties gracefully', () => {
        const incompleteJson = JSON.stringify({ name: 'Incomplete' });
        const page = PageModel.fromJSON(incompleteJson);
        
        expect(page).toBeInstanceOf(PageModel);
        expect(page.name).toBe('Incomplete');
        expect(page.displayOrder).toBeUndefined();
        expect(page.userID).toBeUndefined();
        expect(page.pageID).toBeUndefined();
      });
    });
  });

  describe('MobX observability', () => {
    it('should have observable name property', () => {
      const page = new PageModel('Observable Test', 1, 123);
      
      // Test that the property is observable by checking if it can be changed
      expect(page.name).toBe('Observable Test');
      page.name = 'Changed Name';
      expect(page.name).toBe('Changed Name');
    });

    it('should have observable displayOrder property', () => {
      const page = new PageModel('Test', 5, 123);
      
      expect(page.displayOrder).toBe(5);
      page.displayOrder = 10;
      expect(page.displayOrder).toBe(10);
    });

    it('should have observable userFeeds array', () => {
      const page = new PageModel('Test', 1, 123);
      const userFeed = new UserFeedModel(1, 1, 'Feed', 5);
      
      expect(page.userFeeds).toHaveLength(0);
      page.addUserFeed(userFeed);
      expect(page.userFeeds).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in name', () => {
      const specialName = 'Test & <Page> "with" \'quotes\' & symbols! @#$%^&*()';
      const page = new PageModel(specialName, 1, 123);
      
      expect(page.name).toBe(specialName);
      
      const json = page.JSON;
      const deserializedPage = PageModel.fromJSON(json);
      expect(deserializedPage.name).toBe(specialName);
    });

    it('should handle zero and negative values', () => {
      const page = new PageModel('Zero Test', 0, 0, 0);
      
      expect(page.displayOrder).toBe(0);
      expect(page.userID).toBe(0);
      expect(page.pageID).toBe(0);
    });

    it('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const page = new PageModel('Large Number Test', largeNumber, largeNumber, largeNumber);
      
      expect(page.displayOrder).toBe(largeNumber);
      expect(page.userID).toBe(largeNumber);
      expect(page.pageID).toBe(largeNumber);
    });
  });
});
