import * as logModule from 'debug';
const log = logModule('nffyi-common:User');
const error = logModule('nffyi-common:error');

export class UserModel {
  userID?: number;
  username: string;
  password: string;
  email: string;
  lastAccessDate?: Date;
  roleID: number;

  constructor(username: string, password: string, email: string, roleID: number, userID?: number, lastAccessDate?: Date) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.roleID = roleID
    this.userID = userID;
    this.lastAccessDate = lastAccessDate;
  }

  get JSON() {
    return JSON.stringify({
      userID: this.userID, userName: this.username, password: this.password, email: this.email, lastAccessDate: this.lastAccessDate, roleID: this.roleID
    });
  }

  static fromJSON(json: string) {
    var data = JSON.parse(json);
    var user = new UserModel(data.username, data.password, data.email, data.role, data.userID, data.lastAccessDate);
    log(json + ' => ' + user);
    return user;
  }
}; // /class User

export default UserModel;
