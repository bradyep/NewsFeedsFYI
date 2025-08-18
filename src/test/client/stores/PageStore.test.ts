import { PageStore } from '../../../client/stores/PageStore';
import { PageModel, UserFeedModel } from '../../../common/models';
import { EditableUserFeedModel } from '../../../common/models/UserFeedModel';

describe('PageStore', () => {
  let pageStore: PageStore;
  let mockPages: PageModel[];
  let mockUserFeeds: UserFeedModel[];

  beforeEach(() => {
    mockUserFeeds = [
      new UserFeedModel(1, 1, 'Feed 1', 5, 1, 1, 'https://example.com/feed1', [], 1),
      new UserFeedModel(2, 1, 'Feed 2', 10, 1, 2, 'https://example.com/feed2', [], 2)
    ];

    mockPages = [
      new PageModel('Page 1', 1, 1, 1),
      new PageModel('Page 2', 2, 1, 2)
    ];

    // Add user feeds to the first page
    mockPages[0].userFeeds = mockUserFeeds;
    mockPages[1].userFeeds = [];

    pageStore = new PageStore(mockPages);
  });

  describe('constructor', () => {
    it('should initialize with provided pages', () => {
      expect(pageStore.pages).toEqual(mockPages);
      expect(pageStore.pages).toHaveLength(2);
    });

    it('should set currentlyDisplayedPageID to first page by display order', () => {
      expect(pageStore.currentlyDisplayedPageID).toBe(1);
    });

    it('should handle pages with different display orders', () => {
      const unorderedPages = [
        new PageModel('Third Page', 3, 1, 3),
        new PageModel('First Page', 1, 1, 1),
        new PageModel('Second Page', 2, 1, 2)
      ];
      
      const store = new PageStore(unorderedPages);
      
      expect(store.currentlyDisplayedPageID).toBe(1); // First by display order
    });

    it('should handle empty pages array', () => {
      const store = new PageStore([]);
      expect(store.pages).toEqual([]);
      expect(store.currentlyDisplayedPageID).toBe(-1);
    });
  });

  describe('currentlyDisplayedPage computed', () => {
    it('should return the correct active page', () => {
      const activePage = pageStore.currentlyDisplayedPage;
      
      expect(activePage.pageID).toBe(1);
      expect(activePage.name).toBe('Page 1');
    });

    it('should throw error when no active page is found', () => {
      pageStore.currentlyDisplayedPageID = 999;
      
      expect(() => pageStore.currentlyDisplayedPage).toThrow('No Active Page Set');
    });
  });

  describe('setCurrentlyDisplayedPage', () => {
    it('should set the active page by valid ID', () => {
      pageStore.setCurrentlyDisplayedPage(2);
      
      expect(pageStore.currentlyDisplayedPageID).toBe(2);
      expect(pageStore.currentlyDisplayedPage.name).toBe('Page 2');
    });

    it('should throw error for invalid page ID', () => {
      expect(() => pageStore.setCurrentlyDisplayedPage(999))
        .toThrow("Tried to set active page to a page that doesn't exist");
    });
  });

  describe('setPages', () => {
    it('should replace all pages and reset active page', () => {
      const newPages = [
        new PageModel('New Page 1', 1, 2, 10),
        new PageModel('New Page 2', 2, 2, 11)
      ];
      
      pageStore.setPages(newPages);
      
      expect(pageStore.pages).toEqual(newPages);
      expect(pageStore.currentlyDisplayedPageID).toBe(10);
    });

    it('should sort pages by display order when setting', () => {
      const unorderedPages = [
        new PageModel('Third', 3, 1, 3),
        new PageModel('First', 1, 1, 1),
        new PageModel('Second', 2, 1, 2)
      ];
      
      pageStore.setPages(unorderedPages);
      
      expect(pageStore.currentlyDisplayedPageID).toBe(1); // First by display order
    });
  });

  describe('addPage', () => {
    it('should add a new page to the store', () => {
      const newPage = new PageModel('New Page', 3, 1, 3);
      
      pageStore.addPage(newPage);
      
      expect(pageStore.pages).toHaveLength(3);
      expect(pageStore.pages[2]).toBe(newPage);
    });
  });

  describe('editPage', () => {
    it('should update page name', () => {
      pageStore.editPage(1, { name: 'Updated Page 1' });
      
      expect(pageStore.pages[0].name).toBe('Updated Page 1');
    });

    it('should update display order', () => {
      pageStore.editPage(1, { displayOrder: 5 });
      
      expect(pageStore.pages[0].displayOrder).toBe(5);
    });

    it('should update multiple properties', () => {
      pageStore.editPage(1, { name: 'New Name', displayOrder: 10 });
      
      expect(pageStore.pages[0].name).toBe('New Name');
      expect(pageStore.pages[0].displayOrder).toBe(10);
    });

    it('should not modify pages that do not match ID', () => {
      const originalPage = { ...pageStore.pages[1] };
      
      pageStore.editPage(999, { name: 'Should not change' });
      
      expect(pageStore.pages[1].name).toBe(originalPage.name);
    });

    it('should ignore undefined values', () => {
      const originalPage = { ...pageStore.pages[0] };
      
      pageStore.editPage(1, { name: undefined as any, displayOrder: undefined as any });
      
      expect(pageStore.pages[0].name).toBe(originalPage.name);
      expect(pageStore.pages[0].displayOrder).toBe(originalPage.displayOrder);
    });
  });

  describe('deletePage', () => {
    it('should remove page by ID', () => {
      pageStore.deletePage(1);
      
      expect(pageStore.pages).toHaveLength(1);
      expect(pageStore.pages[0].pageID).toBe(2);
    });

    it('should handle non-existent ID gracefully', () => {
      const originalLength = pageStore.pages.length;
      
      pageStore.deletePage(999);
      
      expect(pageStore.pages).toHaveLength(originalLength);
    });
  });

  describe('userFeedBeingEdited', () => {
    it('should set userFeedBeingEdited', () => {
      const editableFeed: EditableUserFeedModel = {
        name: 'Test Feed',
        itemDisplayCount: 5,
        isEditing: true
      };
      
      pageStore.setUserFeedBeingEdited(editableFeed);
      
      expect(pageStore.userFeedBeingEdited).toStrictEqual(editableFeed);
    });

    it('should clear userFeedBeingEdited', () => {
      const editableFeed: EditableUserFeedModel = {
        name: 'Test Feed',
        itemDisplayCount: 5,
        isEditing: true
      };
      
      pageStore.setUserFeedBeingEdited(editableFeed);
      pageStore.setUserFeedBeingEdited(undefined);
      
      expect(pageStore.userFeedBeingEdited).toBeUndefined();
    });

    it('should update userFeedBeingEdited properties', () => {
      const editableFeed: EditableUserFeedModel = {
        name: 'Test Feed',
        itemDisplayCount: 5,
        isEditing: true
      };
      
      pageStore.setUserFeedBeingEdited(editableFeed);
      pageStore.updateUserFeedBeingEdited({ name: 'Updated Feed', itemDisplayCount: 10 });
      
      expect(pageStore.userFeedBeingEdited?.name).toBe('Updated Feed');
      expect(pageStore.userFeedBeingEdited?.itemDisplayCount).toBe(10);
      expect(pageStore.userFeedBeingEdited?.isEditing).toBe(true); // Should remain unchanged
    });

    it('should not update when userFeedBeingEdited is undefined', () => {
      // No error should be thrown, but nothing should happen
      expect(() => pageStore.updateUserFeedBeingEdited({ name: 'Test' })).not.toThrow();
      expect(pageStore.userFeedBeingEdited).toBeUndefined();
    });
  });

  describe('addUserFeed', () => {
    it('should add user feed to correct page', () => {
      const newUserFeed = new UserFeedModel(1, 2, 'New Feed', 5, 2, 3, 'https://example.com/new', [], 3);
      
      pageStore.addUserFeed(2, newUserFeed);
      
      const page2 = pageStore.pages.find(p => p.pageID === 2);
      expect(page2?.userFeeds).toHaveLength(1);
      expect(page2?.userFeeds[0]).toBe(newUserFeed);
    });

    it('should throw error when page does not exist', () => {
      const newUserFeed = new UserFeedModel(1, 1, 'New Feed', 5, 999, 3, 'https://example.com/new', [], 3);
      
      expect(() => pageStore.addUserFeed(999, newUserFeed))
        .toThrow('Error calling PageStore.addUserFeed: Error: Asked to add userFeed to page that doesnt exist');
    });
  });

  describe('editUserFeed', () => {
    it('should update user feed properties', () => {
      pageStore.editUserFeed(1, { name: 'Updated Feed', itemDisplayCount: 15 });
      
      const updatedFeed = pageStore.pages[0].userFeeds.find(uf => uf.userFeedID === 1);
      expect(updatedFeed?.name).toBe('Updated Feed');
      expect(updatedFeed?.itemDisplayCount).toBe(15);
    });

    it('should update position properties', () => {
      pageStore.editUserFeed(1, { column: 3, row: 2 });
      
      const updatedFeed = pageStore.pages[0].userFeeds.find(uf => uf.userFeedID === 1);
      expect(updatedFeed?.column).toBe(3);
      expect(updatedFeed?.row).toBe(2);
    });

    it('should move user feed to different page', () => {
      // Initially feed 1 is on page 1
      expect(pageStore.pages[0].userFeeds.find(uf => uf.userFeedID === 1)).toBeDefined();
      expect(pageStore.pages[1].userFeeds.find(uf => uf.userFeedID === 1)).toBeUndefined();
      
      pageStore.editUserFeed(1, { pageID: 2 });
      
      // After moving, feed 1 should be on page 2
      expect(pageStore.pages[0].userFeeds.find(uf => uf.userFeedID === 1)).toBeUndefined();
      expect(pageStore.pages[1].userFeeds.find(uf => uf.userFeedID === 1)).toBeDefined();
    });

    it('should handle non-existent user feed gracefully', () => {
      // Should not throw error
      expect(() => pageStore.editUserFeed(999, { name: 'Test' })).not.toThrow();
    });

    it('should ignore undefined values', () => {
      const originalFeed = { ...pageStore.pages[0].userFeeds[0] };
      
      pageStore.editUserFeed(1, { 
        name: undefined as any, 
        column: undefined as any,
        itemDisplayCount: undefined as any 
      });
      
      const updatedFeed = pageStore.pages[0].userFeeds[0];
      expect(updatedFeed.name).toBe(originalFeed.name);
      expect(updatedFeed.column).toBe(originalFeed.column);
      expect(updatedFeed.itemDisplayCount).toBe(originalFeed.itemDisplayCount);
    });
  });

  describe('deleteUserFeed', () => {
    it('should remove user feed from all pages', () => {
      pageStore.deleteUserFeed(1);
      
      const remainingFeeds = pageStore.pages.flatMap(page => page.userFeeds);
      expect(remainingFeeds.find(uf => uf.userFeedID === 1)).toBeUndefined();
      expect(pageStore.pages[0].userFeeds).toHaveLength(1); // Only feed 2 remains
    });

    it('should handle non-existent user feed gracefully', () => {
      const originalFeedCount = pageStore.pages[0].userFeeds.length;
      
      pageStore.deleteUserFeed(999);
      
      expect(pageStore.pages[0].userFeeds).toHaveLength(originalFeedCount);
    });

    it('should remove from correct page when multiple pages have feeds', () => {
      // Add a feed to page 2
      const feed3 = new UserFeedModel(1, 1, 'Feed 3', 5, 2, 3, 'https://example.com/feed3', [], 3);
      pageStore.pages[1].userFeeds.push(feed3);
      
      pageStore.deleteUserFeed(3);
      
      expect(pageStore.pages[1].userFeeds).toHaveLength(0);
      expect(pageStore.pages[0].userFeeds).toHaveLength(2); // Original feeds unchanged
    });
  });

  describe('MobX observability', () => {
    it('should maintain reactive state after complex operations', () => {
      // Add page
      const newPage = new PageModel('Test Page', 3, 1, 3);
      pageStore.addPage(newPage);
      expect(pageStore.pages).toHaveLength(3);
      
      // Edit page
      pageStore.editPage(3, { name: 'Modified Test Page' });
      expect(pageStore.pages[2].name).toBe('Modified Test Page');
      
      // Add user feed
      const newFeed = new UserFeedModel(1, 1, 'Test Feed', 5, 3, 4, 'https://test.com', [], 4);
      pageStore.addUserFeed(3, newFeed);
      expect(pageStore.pages[2].userFeeds).toHaveLength(1);
      
      // Edit user feed
      pageStore.editUserFeed(4, { name: 'Modified Test Feed' });
      expect(pageStore.pages[2].userFeeds[0].name).toBe('Modified Test Feed');
      
      // Delete user feed
      pageStore.deleteUserFeed(4);
      expect(pageStore.pages[2].userFeeds).toHaveLength(0);
      
      // Delete page
      pageStore.deletePage(3);
      expect(pageStore.pages).toHaveLength(2);
    });
  });
});
