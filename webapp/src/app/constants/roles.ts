export enum Roles {
  ADMIN = 0,
  PRO,
  USER,
  GUEST
};

export const ROLE_DB_NAMES = {
  [Roles.ADMIN]: 'admin',
  [Roles.PRO]: 'pro',
  [Roles.USER]: 'user',
  [Roles.GUEST]: 'guest'
};
