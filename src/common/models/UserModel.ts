import debug from 'debug';
const log = debug('common:User');
const error = debug('common:error');

export class UserModel {

  constructor(
    public username: string, 
    public password: string, 
    public email: string, 
    public roleID: number, 
    public userID?: number, 
    public lastAccessDate?: Date
  ) { }

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

// export default UserModel;
