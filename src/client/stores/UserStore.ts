import { observable, action, makeObservable } from 'mobx';
import { UserModel } from 'common/models';

export class UserStore {

  // The Primary User
  public currentUser: UserModel;

  constructor(user: UserModel) {
    // Make properties observable using makeObservable for MobX v6+
    makeObservable(this, {
      currentUser: observable,
      changeCurrentUser: action
    });
    
    if (user) this.currentUser = user;
  }

  // All Users, Not Implemented Yet
/* 
  @observable
  public users: Array<UserModel>;
 */

  /** Change Primary User in User Store. Used when a User creates an account. */
  changeCurrentUser(user:UserModel): void {
    console.log('UserStore.changeCurrentUser called with:', user);
    console.log('Previous user:', this.currentUser);
    this.currentUser = user;
    console.log('New user set:', this.currentUser);
  }

  public nodeenv() {
    return process.env.NODE_ENV;
  }

}

export default UserStore;
