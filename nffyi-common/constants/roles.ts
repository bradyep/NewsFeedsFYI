export enum Roles {
  ADMIN = 1,
  PRO, // 2
  USER, // 3
  GUEST // 4
};

export const ROLE_DB_NAMES = {
  [Roles.ADMIN]: 'admin',
  [Roles.PRO]: 'pro',
  [Roles.USER]: 'user',
  [Roles.GUEST]: 'guest'
};
