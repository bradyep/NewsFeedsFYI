// Declare Express User interface with userID property
declare namespace Express {
  interface User {
    userID: number;
    username?: string;
    roleID: number;
    email?: string;
  }

  interface Request {
    user?: User;
  }
}
