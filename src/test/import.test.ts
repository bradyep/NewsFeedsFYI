import { mockUser, mockPage } from './fixtures/mockData';

describe('Mock Data Import Test', () => {
  test('should import mock data successfully', () => {
    expect(mockUser).toBeDefined();
    expect(mockUser.username).toBe('testuser');
    expect(mockPage).toBeDefined();
    expect(mockPage.name).toBe('Test Page');
  });
});
