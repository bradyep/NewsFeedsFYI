import { LinkStore } from '../../../client/stores/LinkStore';
import { LinkModel } from '../../../common/models';

describe('LinkStore', () => {
  let linkStore: LinkStore;
  let mockLinks: LinkModel[];

  beforeEach(() => {
    mockLinks = [
      new LinkModel('https://google.com', 'Google', 1, 1),
      new LinkModel('https://github.com', 'GitHub', 2, 2)
    ];
    linkStore = new LinkStore(mockLinks);
  });

  describe('constructor', () => {
    it('should initialize with provided fixtures', () => {
      expect(linkStore.links).toEqual(mockLinks);
      expect(linkStore.links).toHaveLength(2);
    });

    it('should initialize with empty array when no fixtures provided', () => {
      const emptyStore = new LinkStore();
      expect(emptyStore.links).toEqual([]);
      expect(emptyStore.links).toHaveLength(0);
    });

    it('should initialize with undefined fixtures', () => {
      const undefinedStore = new LinkStore(undefined);
      expect(undefinedStore.links).toEqual([]);
    });
  });

  describe('addLink', () => {
    it('should add a new link to the store', () => {
      const newLink = new LinkModel('https://stackoverflow.com', 'Stack Overflow', 3, 3);
      
      linkStore.addLink(newLink);
      
      expect(linkStore.links).toHaveLength(3);
      expect(linkStore.links[2]).toBe(newLink);
    });

    it('should maintain order when adding multiple links', () => {
      const link1 = new LinkModel('https://link1.com', 'Link 1', 3, 3);
      const link2 = new LinkModel('https://link2.com', 'Link 2', 4, 4);
      
      linkStore.addLink(link1);
      linkStore.addLink(link2);
      
      expect(linkStore.links).toHaveLength(4);
      expect(linkStore.links[2]).toBe(link1);
      expect(linkStore.links[3]).toBe(link2);
    });
  });

  describe('editLink', () => {
    it('should update link name', () => {
      const linkId = mockLinks[0].linkID!;
      
      linkStore.editLink(linkId, { name: 'Updated Google' });
      
      expect(linkStore.links[0].name).toBe('Updated Google');
      expect(linkStore.links[0].url).toBe('https://google.com'); // unchanged
    });

    it('should update link URL', () => {
      const linkId = mockLinks[1].linkID!;
      
      linkStore.editLink(linkId, { url: 'https://github.com/updated' });
      
      expect(linkStore.links[1].url).toBe('https://github.com/updated');
      expect(linkStore.links[1].name).toBe('GitHub'); // unchanged
    });

    it('should update display order', () => {
      const linkId = mockLinks[0].linkID!;
      
      linkStore.editLink(linkId, { displayOrder: 99 });
      
      expect(linkStore.links[0].displayOrder).toBe(99);
    });

    it('should update multiple properties at once', () => {
      const linkId = mockLinks[0].linkID!;
      
      linkStore.editLink(linkId, {
        name: 'New Google',
        url: 'https://google.com/new',
        displayOrder: 100
      });
      
      expect(linkStore.links[0].name).toBe('New Google');
      expect(linkStore.links[0].url).toBe('https://google.com/new');
      expect(linkStore.links[0].displayOrder).toBe(100);
    });

    it('should not modify links that do not match the ID', () => {
      const originalLink1 = { ...mockLinks[1] };
      
      linkStore.editLink(999, { name: 'Should not change' });
      
      expect(linkStore.links[1]).toEqual(originalLink1);
    });

    it('should ignore undefined or null values', () => {
      const linkId = mockLinks[0].linkID!;
      const originalLink = { ...mockLinks[0] };
      
      linkStore.editLink(linkId, { 
        name: undefined as any, 
        url: null as any,
        displayOrder: undefined as any 
      });
      
      expect(linkStore.links[0]).toEqual(originalLink);
    });
  });

  describe('deleteLink', () => {
    it('should remove link by ID', () => {
      const linkIdToDelete = mockLinks[0].linkID!;
      
      linkStore.deleteLink(linkIdToDelete);
      
      expect(linkStore.links).toHaveLength(1);
      expect(linkStore.links[0].linkID).toBe(mockLinks[1].linkID);
    });

    it('should not affect other links when deleting', () => {
      const remainingLink = { ...mockLinks[1] };
      
      linkStore.deleteLink(mockLinks[0].linkID!);
      
      expect(linkStore.links[0]).toEqual(remainingLink);
    });

    it('should handle non-existent ID gracefully', () => {
      const originalLength = linkStore.links.length;
      
      linkStore.deleteLink(999);
      
      expect(linkStore.links).toHaveLength(originalLength);
      expect(linkStore.links).toEqual(mockLinks);
    });

    it('should be able to delete all links', () => {
      linkStore.deleteLink(mockLinks[0].linkID!);
      linkStore.deleteLink(mockLinks[1].linkID!);
      
      expect(linkStore.links).toHaveLength(0);
    });
  });

  describe('clearOutLinks', () => {
    it('should remove all links', () => {
      linkStore.clearOutLinks();
      
      expect(linkStore.links).toEqual([]);
      expect(linkStore.links).toHaveLength(0);
    });

    it('should work on already empty store', () => {
      const emptyStore = new LinkStore();
      
      emptyStore.clearOutLinks();
      
      expect(emptyStore.links).toEqual([]);
    });
  });

  describe('MobX observability', () => {
    it('should maintain reactive state after operations', () => {
      const newLink = new LinkModel('https://test.com', 'Test', 3, 3);
      
      linkStore.addLink(newLink);
      expect(linkStore.links).toHaveLength(3);
      
      linkStore.editLink(newLink.linkID!, { name: 'Modified Test' });
      expect(linkStore.links[2].name).toBe('Modified Test');
      
      linkStore.deleteLink(newLink.linkID!);
      expect(linkStore.links).toHaveLength(2);
    });
  });
});
