import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSection } from '../../../../client/components/TopHeaderComponents/ProfileSection';
import { UserStore } from '../../../../client/stores/UserStore';
import { UserModel } from '../../../../common/models';
import { Roles } from '../../../../common/constants';
import * as api from '../../../../client/services/api';

jest.mock('../../../../client/services/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  fetchCsrfToken: jest.fn()
}));

const mockedApi = api as jest.Mocked<typeof api>;

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
    get isLoggedIn() {
      return defaultUser.roleID !== Roles.GUEST;
    },
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

  it('should render the sign-in view (not sign-out) for a guest user', () => {
    const mockUserStore = createMockUserStore({ roleID: Roles.GUEST });
    render(<ProfileSection changeCurrentUser={mockChangeCurrentUser} userStore={mockUserStore} />);

    expect(screen.getByTestId('open-signin')).toBeInTheDocument();
    expect(screen.getByTestId('open-signup')).toBeInTheDocument();
  });

  it('should render the signed-in view (not sign-in) for a logged-in user', () => {
    const mockUserStore = createMockUserStore({ roleID: Roles.USER, username: 'testuser' });
    render(<ProfileSection changeCurrentUser={mockChangeCurrentUser} userStore={mockUserStore} />);

    expect(screen.queryByTestId('open-signin')).not.toBeInTheDocument();
    expect(screen.getByText(/Signed In As testuser/)).toBeInTheDocument();
  });

  describe('sign up validation (regression: confirmPassword used to be captured but never checked)', () => {
    it('should not call register() when password and confirm password do not match', async () => {
      const mockUserStore = createMockUserStore({ roleID: Roles.GUEST });
      render(<ProfileSection changeCurrentUser={mockChangeCurrentUser} userStore={mockUserStore} />);

      fireEvent.click(screen.getByTestId('open-signup'));

      fireEvent.change(document.getElementById('username')!, { target: { value: 'newuser' } });
      fireEvent.change(document.getElementById('email')!, { target: { value: 'new@test.com' } });
      fireEvent.change(document.getElementById('password')!, { target: { value: 'password123' } });
      fireEvent.change(document.getElementById('confirmPassword')!, { target: { value: 'different123' } });

      fireEvent.click(screen.getByTestId('submit-auth'));

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
      expect(mockedApi.register).not.toHaveBeenCalled();
    });

    it('should not call register() when the password is shorter than the minimum length', async () => {
      const mockUserStore = createMockUserStore({ roleID: Roles.GUEST });
      render(<ProfileSection changeCurrentUser={mockChangeCurrentUser} userStore={mockUserStore} />);

      fireEvent.click(screen.getByTestId('open-signup'));

      fireEvent.change(document.getElementById('username')!, { target: { value: 'newuser' } });
      fireEvent.change(document.getElementById('email')!, { target: { value: 'new@test.com' } });
      fireEvent.change(document.getElementById('password')!, { target: { value: 'short' } });
      fireEvent.change(document.getElementById('confirmPassword')!, { target: { value: 'short' } });

      fireEvent.click(screen.getByTestId('submit-auth'));

      await waitFor(() => {
        expect(screen.getByText(/at least/i)).toBeInTheDocument();
      });
      expect(mockedApi.register).not.toHaveBeenCalled();
    });

    it('should call register() and then login() when signup passes validation', async () => {
      mockedApi.register.mockResolvedValue({ ok: true, status: 200, user: { userID: 5, username: 'newuser', roleID: Roles.USER } });
      mockedApi.login.mockResolvedValue({ ok: true, status: 200, user: { userID: 5, username: 'newuser', roleID: Roles.USER } });

      const mockUserStore = createMockUserStore({ roleID: Roles.GUEST });
      render(<ProfileSection changeCurrentUser={mockChangeCurrentUser} userStore={mockUserStore} />);

      fireEvent.click(screen.getByTestId('open-signup'));

      fireEvent.change(document.getElementById('username')!, { target: { value: 'newuser' } });
      fireEvent.change(document.getElementById('email')!, { target: { value: 'new@test.com' } });
      fireEvent.change(document.getElementById('password')!, { target: { value: 'password123' } });
      fireEvent.change(document.getElementById('confirmPassword')!, { target: { value: 'password123' } });

      fireEvent.click(screen.getByTestId('submit-auth'));

      await waitFor(() => {
        expect(mockedApi.register).toHaveBeenCalledWith(expect.any(String), 'newuser', 'password123', 'new@test.com');
      });
      await waitFor(() => {
        expect(mockedApi.login).toHaveBeenCalledWith(expect.any(String), 'newuser', 'password123');
      });
    });
  });

  describe('sign in (regression: response.ok used to never be checked)', () => {
    it('should not treat the user as signed in when login() resolves with ok:false', async () => {
      mockedApi.login.mockResolvedValue({ ok: false, status: 401, message: 'Incorrect password' });

      const mockUserStore = createMockUserStore({ roleID: Roles.GUEST });
      render(<ProfileSection changeCurrentUser={mockChangeCurrentUser} userStore={mockUserStore} />);

      fireEvent.click(screen.getByTestId('open-signin'));
      fireEvent.change(document.getElementById('username')!, { target: { value: 'testuser' } });
      fireEvent.change(document.getElementById('password')!, { target: { value: 'wrongpassword' } });

      fireEvent.click(screen.getByTestId('submit-auth'));

      await waitFor(() => {
        expect(screen.getByText(/Incorrect password/i)).toBeInTheDocument();
      });
      expect(mockChangeCurrentUser).not.toHaveBeenCalled();
      // Modal should still be open since sign-in did not succeed
      expect(screen.getByTestId('submit-auth')).toBeInTheDocument();
    });

    it('should call changeCurrentUser() and close the modal when login() resolves with ok:true', async () => {
      mockedApi.login.mockResolvedValue({ ok: true, status: 200, user: { userID: 1, username: 'testuser', roleID: Roles.USER } });

      const mockUserStore = createMockUserStore({ roleID: Roles.GUEST });
      render(<ProfileSection changeCurrentUser={mockChangeCurrentUser} userStore={mockUserStore} />);

      fireEvent.click(screen.getByTestId('open-signin'));
      fireEvent.change(document.getElementById('username')!, { target: { value: 'testuser' } });
      fireEvent.change(document.getElementById('password')!, { target: { value: 'correctpassword' } });

      fireEvent.click(screen.getByTestId('submit-auth'));

      await waitFor(() => {
        expect(mockChangeCurrentUser).toHaveBeenCalled();
      });
    });
  });
});
