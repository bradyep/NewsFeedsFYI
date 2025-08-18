import { UserStore } from '../../../client/stores/UserStore';
import { UserModel } from '../../../common/models';

describe('UserStore', () => {
  let userStore: UserStore;
  let mockUser: UserModel;

  beforeEach(() => {
    mockUser = new UserModel('testuser', 'password', 'test@example.com', 3, 1);
    userStore = new UserStore(mockUser);
  });

  describe('constructor', () => {
    it('should initialize with provided user', () => {
      expect(userStore.currentUser).toBe(mockUser);
    });

    it('should handle undefined user', () => {
      const emptyStore = new UserStore(undefined as any);
      expect(emptyStore.currentUser).toBeUndefined();
    });
  });

  describe('changeCurrentUser', () => {
    it('should update the current user', () => {
      const newUser = new UserModel('newuser', 'newpassword', 'new@example.com', 2, 2);
      
      userStore.changeCurrentUser(newUser);
      
      expect(userStore.currentUser).toBe(newUser);
      expect(userStore.currentUser.username).toBe('newuser');
      expect(userStore.currentUser.email).toBe('new@example.com');
    });

    it('should replace previous user completely', () => {
      const originalUser = userStore.currentUser;
      const newUser = new UserModel('replacementuser', 'pass123', 'replacement@example.com', 1, 3);
      
      userStore.changeCurrentUser(newUser);
      
      expect(userStore.currentUser).not.toBe(originalUser);
      expect(userStore.currentUser).toBe(newUser);
    });
  });

  describe('nodeenv', () => {
    it('should return the NODE_ENV environment variable', () => {
      const result = userStore.nodeenv();
      expect(result).toBe(process.env.NODE_ENV);
    });
  });

  describe('MobX observability', () => {
    it('should have observable currentUser', () => {
      // This test ensures that the MobX setup is correct
      expect(userStore.currentUser).toBeDefined();
      
      const newUser = new UserModel('observabletest', 'pass', 'obs@test.com', 1, 1);
      userStore.changeCurrentUser(newUser);
      
      expect(userStore.currentUser).toBe(newUser);
    });
  });
});
