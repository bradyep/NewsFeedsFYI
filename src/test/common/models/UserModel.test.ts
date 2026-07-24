import { UserModel } from '../../../common/models';

describe('UserModel.toSafeObject', () => {
  it('should never include the password field', () => {
    const user = new UserModel('testuser', 'super-secret-hash', 'test@example.com', 3, 1, new Date());

    const safe = user.toSafeObject();

    expect(safe).not.toHaveProperty('password');
  });

  it('should include the other public fields', () => {
    const lastAccessDate = new Date('2026-01-01');
    const user = new UserModel('testuser', 'super-secret-hash', 'test@example.com', 3, 1, lastAccessDate);

    const safe = user.toSafeObject();

    expect(safe).toEqual({
      userID: 1,
      username: 'testuser',
      email: 'test@example.com',
      roleID: 3,
      lastAccessDate
    });
  });

  it('should never include the password field even when serialized to JSON (as res.json would)', () => {
    const user = new UserModel('testuser', 'super-secret-hash', 'test@example.com', 3, 1);

    const serialized = JSON.parse(JSON.stringify(user.toSafeObject()));

    expect(serialized).not.toHaveProperty('password');
    expect(JSON.stringify(serialized)).not.toContain('super-secret-hash');
  });
});
