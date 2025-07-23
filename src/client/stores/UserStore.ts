import { observable, action } from 'mobx';
import { UserModel } from 'common/models';

export class UserStore {

  constructor(user: UserModel) {
    if (user) this.currentUser = user;
  }

  // The Primary User
  @observable public currentUser: UserModel;

  // All Users, Not Implemented Yet
/* 
  @observable
  public users: Array<UserModel>;
 */

  /** Change Primary User in User Store. Used when a User creates an account. */
  @action
  changeCurrentUser(user:UserModel): void {
    this.currentUser = user;
  }

  public nodeenv() {
    return process.env.NODE_ENV;
  }

}

export default UserStore;
