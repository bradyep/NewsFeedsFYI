// Declare Express User interface with userID property
declare namespace Express {
  interface User {
    userID: number;
    username?: string;
    email?: string;
  }
}
