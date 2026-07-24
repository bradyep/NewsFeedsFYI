import bcrypt = require('bcryptjs');
import * as usersModel from '../../../server/sequelize/users-sequelize';
import { UserModel } from '../../../common/models';

// Mock the underlying DB connection layer, not bcrypt - we want real hashing behavior.
jest.mock('../../../server/sequelize/nffyi-sequelize');
const mockModelDef = require('../../../server/sequelize/nffyi-sequelize');

describe('users-sequelize password hashing', () => {
  let mockSQUser: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSQUser = {
      create: jest.fn(),
      findOne: jest.fn()
    };
    mockModelDef.connectDB.mockResolvedValue(mockSQUser);
  });

  describe('create', () => {
    it('should persist a bcrypt hash, not the plaintext password', async () => {
      mockSQUser.create.mockImplementation((attrs: any) => Promise.resolve(attrs));

      const user = new UserModel('newuser', 'plaintext-password', 'new@test.com', 3);
      await usersModel.create(user);

      expect(mockSQUser.create).toHaveBeenCalledTimes(1);
      const persistedAttrs = mockSQUser.create.mock.calls[0][0];

      expect(persistedAttrs.password).not.toBe('plaintext-password');
      expect(bcrypt.compareSync('plaintext-password', persistedAttrs.password)).toBe(true);
    });
  });

  describe('update', () => {
    it('should hash a newly-supplied password', async () => {
      const mockUserInstance = { update: jest.fn((attrs: any) => Promise.resolve(attrs)) };
      mockSQUser.findOne.mockResolvedValue(mockUserInstance);

      await usersModel.update(1, 'someuser', 'new-plaintext-password', 'user@test.com');

      expect(mockUserInstance.update).toHaveBeenCalledTimes(1);
      const updatedAttrs = mockUserInstance.update.mock.calls[0][0];

      expect(updatedAttrs.password).not.toBe('new-plaintext-password');
      expect(bcrypt.compareSync('new-plaintext-password', updatedAttrs.password)).toBe(true);
    });

    it('should leave the existing password hash untouched when no new password is supplied', async () => {
      const mockUserInstance = { update: jest.fn((attrs: any) => Promise.resolve(attrs)) };
      mockSQUser.findOne.mockResolvedValue(mockUserInstance);

      await usersModel.update(1, 'someuser', '', 'user@test.com');

      const updatedAttrs = mockUserInstance.update.mock.calls[0][0];
      expect(updatedAttrs.password).toBeUndefined();
    });
  });

  describe('userPasswordCheck', () => {
    it('should return check:true for the correct password against a stored hash', async () => {
      const storedHash = bcrypt.hashSync('correct-password', 10);
      mockSQUser.findOne.mockResolvedValue({ userID: 1, username: 'testuser', password: storedHash, roleID: 3 });

      const result = await usersModel.userPasswordCheck('testuser', 'correct-password');

      expect(result.check).toBe(true);
      expect(result.userid).toBe(1);
    });

    it('should return check:false for an incorrect password against a stored hash', async () => {
      const storedHash = bcrypt.hashSync('correct-password', 10);
      mockSQUser.findOne.mockResolvedValue({ userID: 1, username: 'testuser', password: storedHash, roleID: 3 });

      const result = await usersModel.userPasswordCheck('testuser', 'wrong-password');

      expect(result.check).toBe(false);
      expect(result.message).toBe('Incorrect password');
    });

    it('should return check:false when the user does not exist', async () => {
      mockSQUser.findOne.mockResolvedValue(null);

      const result = await usersModel.userPasswordCheck('nonexistent', 'anything');

      expect(result.check).toBe(false);
      expect(result.message).toBe('Could not find user');
    });
  });
});
