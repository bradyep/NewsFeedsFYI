import { observable, computed, action, makeObservable } from 'mobx';
import { UserModel } from 'common/models';
import { Roles } from 'common/constants';
import debug from 'debug';
const log = debug('webapp:UserStore');

export class UserStore {

  public currentUser: UserModel;

  constructor(user: UserModel) {
    makeObservable(this, {
      currentUser: observable,
      isLoggedIn: computed,
      changeCurrentUser: action
    });

    this.currentUser = user;
  }

  get isLoggedIn(): boolean {
    return this.currentUser.roleID !== Roles.GUEST;
  }

  changeCurrentUser(user:UserModel): void {
    log('UserStore.changeCurrentUser called with:', user);
    log('Previous user:', this.currentUser);
    this.currentUser = user;
    log('New user set:', this.currentUser);
  }

  public nodeenv() {
    return process.env.NODE_ENV;
  }

}

export default UserStore;
