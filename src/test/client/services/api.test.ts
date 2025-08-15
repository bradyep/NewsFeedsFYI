import { jest } from '@jest/globals';

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Import the module under test
import * as apiService from '../../../client/services/api';

// Helper function to create mock Response
const createMockResponse = (data: any, ok = true, status = 200): Response => {
  const mockJson = jest.fn() as any;
  mockJson.mockResolvedValue(data);
  return {
    json: mockJson,
    ok,
    status,
  } as unknown as Response;
};

// Helper function to create mock Response that throws on json()
const createMockErrorResponse = (error: Error, ok = true, status = 200): Response => {
  const mockJson = jest.fn() as any;
  mockJson.mockRejectedValue(error);
  return {
    json: mockJson,
    ok,
    status,
  } as unknown as Response;
};

describe('api service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCurrentUser', () => {
    const testUrl = 'https://example.com/api/user';

    it('should fetch and return user data successfully', async () => {
      // Arrange
      const mockUserData = {
        userID: 123,
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com'
      };

      mockFetch.mockResolvedValue(createMockResponse(mockUserData));

      // Act
      const result = await apiService.getCurrentUser(testUrl);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(testUrl, { credentials: "include" });
      expect(result).toEqual(mockUserData);
    });

    it('should return undefined when fetch throws an error', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await apiService.getCurrentUser(testUrl);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when response.json() throws an error', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockErrorResponse(new Error('JSON parse error')));

      // Act
      const result = await apiService.getCurrentUser(testUrl);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should include credentials in the request', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockResponse({}));

      // Act
      await apiService.getCurrentUser(testUrl);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(testUrl, { credentials: "include" });
    });
  });

  describe('getLinks', () => {
    const testUrl = 'https://example.com/api/links';

    it('should fetch and return links data successfully', async () => {
      // Arrange
      const mockLinksData = [
        {
          linkID: 1,
          url: 'https://example1.com',
          name: 'Example 1',
          displayOrder: 1
        },
        {
          linkID: 2,
          url: 'https://example2.com',
          name: 'Example 2',
          displayOrder: 2
        }
      ];

      mockFetch.mockResolvedValue(createMockResponse(mockLinksData));

      // Act
      const result = await apiService.getLinks(testUrl);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(testUrl, { credentials: "include" });
      expect(result).toEqual(mockLinksData);
      expect(result).toHaveLength(2);
    });

    it('should return undefined when fetch throws an error', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await apiService.getLinks(testUrl);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when response.json() throws an error', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockErrorResponse(new Error('JSON parse error')));

      // Act
      const result = await apiService.getLinks(testUrl);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle empty links array', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockResponse([]));

      // Act
      const result = await apiService.getLinks(testUrl);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUserPageFeeds', () => {
    const pageURL = 'https://example.com/api/userfeeds/page/';
    const pageId = 123;

    it('should fetch and return user feeds for a page successfully', async () => {
      // Arrange
      const mockUserFeeds = [
        {
          userFeedID: 1,
          column: 1,
          row: 1,
          name: 'Test Feed 1',
          itemDisplayCount: 10,
          pageID: pageId,
          feedSourceID: 101
        },
        {
          userFeedID: 2,
          column: 2,
          row: 1,
          name: 'Test Feed 2',
          itemDisplayCount: 15,
          pageID: pageId,
          feedSourceID: 102
        }
      ];

      mockFetch.mockResolvedValue(createMockResponse(mockUserFeeds));

      // Act
      const result = await apiService.getUserPageFeeds(pageURL, pageId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`${pageURL}${pageId}`, { credentials: "include" });
      expect(result).toEqual(mockUserFeeds);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when fetch throws an error', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await apiService.getUserPageFeeds(pageURL, pageId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when response.json() throws an error', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockErrorResponse(new Error('JSON parse error')));

      // Act
      const result = await apiService.getUserPageFeeds(pageURL, pageId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should construct URL correctly with pageId', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockResponse([]));
      const testPageId = 456;

      // Act
      await apiService.getUserPageFeeds(pageURL, testPageId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`${pageURL}${testPageId}`, { credentials: "include" });
    });

    it('should handle empty user feeds array', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockResponse([]));

      // Act
      const result = await apiService.getUserPageFeeds(pageURL, pageId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUsersPagesWithFirstPopulated', () => {
    const pagesURL = 'https://example.com/api/pages';
    const pageURL = 'https://example.com/api/userfeeds/page/';

    it('should fetch pages and populate first page with user feeds', async () => {
      // Arrange
      const mockPagesData = [
        {
          pageID: 1,
          name: 'First Page',
          displayOrder: 1,
          userFeeds: []
        },
        {
          pageID: 2,
          name: 'Second Page',
          displayOrder: 2,
          userFeeds: []
        }
      ];

      const mockUserFeeds = [
        {
          userFeedID: 1,
          column: 1,
          row: 1,
          name: 'Test Feed',
          itemDisplayCount: 10,
          pageID: 1,
          feedSourceID: 101
        }
      ];

      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockPagesData)) // First call for pages
        .mockResolvedValueOnce(createMockResponse(mockUserFeeds)); // Second call for user feeds

      // Act
      const result = await apiService.getUsersPagesWithFirstPopulated(pagesURL, pageURL);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, pagesURL, { credentials: "include" });
      expect(mockFetch).toHaveBeenNthCalledWith(2, `${pageURL}1`, { credentials: "include" });
      
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result![0].userFeeds).toEqual(mockUserFeeds);
      expect(result![1].userFeeds).toEqual([]); // Second page should still have empty userFeeds
    });

    it('should return undefined when pages fetch throws an error', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await apiService.getUsersPagesWithFirstPopulated(pagesURL, pageURL);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when first page has no pageID', async () => {
      // Arrange
      const mockPagesData = [
        {
          pageID: undefined, // Missing pageID
          name: 'First Page',
          displayOrder: 1,
          userFeeds: []
        }
      ];

      mockFetch.mockResolvedValue(createMockResponse(mockPagesData));

      // Act
      const result = await apiService.getUsersPagesWithFirstPopulated(pagesURL, pageURL);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle user feeds fetch error gracefully', async () => {
      // Arrange
      const mockPagesData = [
        {
          pageID: 1,
          name: 'First Page',
          displayOrder: 1,
          userFeeds: []
        }
      ];

      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockPagesData)) // First call for pages succeeds
        .mockRejectedValueOnce(new Error('User feeds fetch error')); // Second call fails

      // Act
      const result = await apiService.getUsersPagesWithFirstPopulated(pagesURL, pageURL);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined(); // Should still return pages data
      expect(result![0].userFeeds).toEqual([]); // UserFeeds should be empty array due to getUserPageFeeds error handling
    });

    it('should handle empty pages array', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockResponse([]));

      // Act
      const result = await apiService.getUsersPagesWithFirstPopulated(pagesURL, pageURL);

      // Assert
      expect(result).toBeUndefined(); // Should fail when trying to access pagesData[0]
    });

    it('should correctly pass pageID to getUserPageFeeds', async () => {
      // Arrange
      const testPageID = 999;
      const mockPagesData = [
        {
          pageID: testPageID,
          name: 'Test Page',
          displayOrder: 1,
          userFeeds: []
        }
      ];

      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockPagesData))
        .mockResolvedValueOnce(createMockResponse([]));

      // Act
      await apiService.getUsersPagesWithFirstPopulated(pagesURL, pageURL);

      // Assert
      expect(mockFetch).toHaveBeenNthCalledWith(2, `${pageURL}${testPageID}`, { credentials: "include" });
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle fetch with non-JSON response', async () => {
      // Arrange
      mockFetch.mockResolvedValue(createMockErrorResponse(new Error('Unexpected token < in JSON')));

      // Act
      const userResult = await apiService.getCurrentUser('test-url');
      const linksResult = await apiService.getLinks('test-url');
      const userFeedsResult = await apiService.getUserPageFeeds('test-url', 1);

      // Assert
      expect(userResult).toBeUndefined();
      expect(linksResult).toBeUndefined();
      expect(userFeedsResult).toEqual([]);
    });

    it('should handle network timeout/abort errors', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('The operation was aborted'));

      // Act
      const userResult = await apiService.getCurrentUser('test-url');
      const linksResult = await apiService.getLinks('test-url');
      const userFeedsResult = await apiService.getUserPageFeeds('test-url', 1);
      const pagesResult = await apiService.getUsersPagesWithFirstPopulated('pages-url', 'page-url');

      // Assert
      expect(userResult).toBeUndefined();
      expect(linksResult).toBeUndefined();
      expect(userFeedsResult).toEqual([]);
      expect(pagesResult).toBeUndefined();
    });

    it('should handle HTTP error status codes', async () => {
      // Arrange
      const errorData = { error: 'Unauthorized' };
      mockFetch.mockResolvedValue(createMockResponse(errorData, false, 401));

      // Act - The functions don't check response.ok, so they'll still try to parse JSON
      const userResult = await apiService.getCurrentUser('test-url');
      const linksResult = await apiService.getLinks('test-url');

      // Assert
      expect(userResult).toEqual(errorData);
      expect(linksResult).toEqual(errorData);
    });

    it('should handle URLs with different formats', async () => {
      // Arrange
      const baseUrl = 'http://localhost:3000';
      const relativeUrl = '/api/user';
      const absoluteUrl = 'https://api.example.com/user';
      
      mockFetch.mockResolvedValue(createMockResponse({}));

      // Act
      await apiService.getCurrentUser(baseUrl);
      await apiService.getCurrentUser(relativeUrl);
      await apiService.getCurrentUser(absoluteUrl);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(baseUrl, { credentials: "include" });
      expect(mockFetch).toHaveBeenCalledWith(relativeUrl, { credentials: "include" });
      expect(mockFetch).toHaveBeenCalledWith(absoluteUrl, { credentials: "include" });
    });

    it('should handle different pageId types for getUserPageFeeds', async () => {
      // Arrange
      const pageURL = 'https://example.com/api/userfeeds/page/';
      mockFetch.mockResolvedValue(createMockResponse([]));

      // Act
      await apiService.getUserPageFeeds(pageURL, 0);
      await apiService.getUserPageFeeds(pageURL, 999999);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`${pageURL}0`, { credentials: "include" });
      expect(mockFetch).toHaveBeenCalledWith(`${pageURL}999999`, { credentials: "include" });
    });
  });
});
