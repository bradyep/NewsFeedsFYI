import { render } from '@testing-library/react';
import { ProfileSection } from '../../../../client/components/TopHeaderComponents/ProfileSection';
import { UserStore } from '../../../../client/stores/UserStore';
import { UserModel } from '../../../../common/models';
import { Roles } from '../../../../common/constants';

// Create a simple mock for UserStore
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

describe('ProfileSection Component', () => {
  const mockChangeCurrentUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing for guest user', () => {
    // Arrange
    const mockUserStore = createMockUserStore({ roleID: Roles.GUEST });

    // Act & Assert - Should not throw
    expect(() => 
      render(
        <ProfileSection 
          changeCurrentUser={mockChangeCurrentUser} 
          userStore={mockUserStore} 
        />
      )
    ).not.toThrow();
  });

  it('should render without crashing for authenticated user', () => {
    // Arrange
    const mockUserStore = createMockUserStore({ 
      roleID: Roles.USER,
      username: 'testuser'
    });

    // Act & Assert - Should not throw
    expect(() => 
      render(
        <ProfileSection 
          changeCurrentUser={mockChangeCurrentUser} 
          userStore={mockUserStore} 
        />
      )
    ).not.toThrow();
  });

  it('should accept required props without errors', () => {
    // Arrange
    const mockUserStore = createMockUserStore();

    // Act
    const renderComponent = () => render(
      <ProfileSection 
        changeCurrentUser={mockChangeCurrentUser} 
        userStore={mockUserStore} 
      />
    );

    // Assert
    expect(renderComponent).not.toThrow();
  });
});