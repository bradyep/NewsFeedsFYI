import { render } from '@testing-library/react';
import { NewsFeeds } from '../../../client/components/BodyComponents/NewsFeeds';
import { PageStore } from '../../../client/stores/PageStore';
import { UserStore } from '../../../client/stores/UserStore';
import { PageModel } from '../../../common/models/PageModel';
import { UserModel } from '../../../common/models/UserModel';
import { Roles } from '../../../common/constants';

// Create mock stores
const createMockUserStore = (userOverrides: Partial<UserModel> = {}) => {
  const defaultUser = new UserModel(
    'testuser',
    'password', 
    'test@example.com',
    Roles.GUEST,
    1,
    new Date()
  );
  
  // Apply overrides
  Object.assign(defaultUser, userOverrides);

  return {
    currentUser: defaultUser,
    changeCurrentUser: jest.fn(),
    nodeenv: jest.fn(() => 'test')
  } as unknown as UserStore;
};

const createMockPageStore = () => {
  const defaultPage = new PageModel('Test Page', 1, 1, 1);
  
  // Add empty userFeeds array to prevent errors
  defaultPage.userFeeds = [];

  return {
    currentlyDisplayedPage: defaultPage,
    currentlyDisplayedPageID: 1,
    pages: [defaultPage],
    userFeedBeingEdited: undefined,
    setCurrentlyDisplayedPage: jest.fn(),
    setUserFeedBeingEdited: jest.fn(),
    setPages: jest.fn(),
    addPage: jest.fn(),
    editPage: jest.fn(),
    deletePage: jest.fn(),
    addUserFeed: jest.fn(),
    editUserFeed: jest.fn(),
    deleteUserFeed: jest.fn(),
    updateUserFeedBeingEdited: jest.fn(),
  } as unknown as PageStore;
};

describe('NewsFeeds Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing with empty user feeds', () => {
    // Arrange
    const mockUserStore = createMockUserStore();
    const mockPageStore = createMockPageStore();

    // Act & Assert - Should not throw
    expect(() => 
      render(
        <NewsFeeds 
          pageStore={mockPageStore} 
          userStore={mockUserStore} 
        />
      )
    ).not.toThrow();
  });

  it('should render with debug style when DEBUG_LAYOUT is true', () => {
    // Arrange
    const originalEnv = process.env.DEBUG_LAYOUT;
    process.env.DEBUG_LAYOUT = 'true';
    const mockUserStore = createMockUserStore();
    const mockPageStore = createMockPageStore();

    // Act
    const { container } = render(
      <NewsFeeds 
        pageStore={mockPageStore} 
        userStore={mockUserStore} 
      />
    );

    // Assert
    const newsDiv = container.querySelector('.allNews');
    expect(newsDiv).toHaveStyle({
      backgroundColor: '#fce4ec',
      padding: '8px'
    });

    // Cleanup
    process.env.DEBUG_LAYOUT = originalEnv;
  });

  it('should render without debug style when DEBUG_LAYOUT is not true', () => {
    // Arrange
    const originalEnv = process.env.DEBUG_LAYOUT;
    process.env.DEBUG_LAYOUT = 'false';
    const mockUserStore = createMockUserStore();
    const mockPageStore = createMockPageStore();

    // Act
    const { container } = render(
      <NewsFeeds 
        pageStore={mockPageStore} 
        userStore={mockUserStore} 
      />
    );

    // Assert
    const newsDiv = container.querySelector('.allNews');
    expect(newsDiv).not.toHaveStyle({
      backgroundColor: '#fce4ec',
      padding: '8px'
    });

    // Cleanup
    process.env.DEBUG_LAYOUT = originalEnv;
  });

  it('should render three columns', () => {
    // Arrange
    const mockUserStore = createMockUserStore();
    const mockPageStore = createMockPageStore();

    // Act
    const { container } = render(
      <NewsFeeds 
        pageStore={mockPageStore} 
        userStore={mockUserStore} 
      />
    );

    // Assert
    const columns = container.querySelectorAll('.col-md-4');
    expect(columns).toHaveLength(3);
  });

  it('should accept required props without errors', () => {
    // Arrange
    const mockUserStore = createMockUserStore();
    const mockPageStore = createMockPageStore();

    // Act
    const renderComponent = () => render(
      <NewsFeeds 
        pageStore={mockPageStore} 
        userStore={mockUserStore} 
      />
    );

    // Assert
    expect(renderComponent).not.toThrow();
  });
});
