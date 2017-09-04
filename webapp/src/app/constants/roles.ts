export enum Roles {
  ADMIN = 0,
  USER,
  GUEST
};

export const ROLE_DB_NAMES = {
  [Roles.ADMIN]: 'admin',
  [Roles.USER]: 'user',
  [Roles.GUEST]: 'guest'
};
