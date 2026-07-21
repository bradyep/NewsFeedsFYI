import { observable, action, makeObservable } from 'mobx';
import { UserModel } from 'common/models';
import debug from 'debug';
const log = debug('webapp:UserStore');

export class UserStore {

  public currentUser: UserModel;

  constructor(user: UserModel) {
    makeObservable(this, {
      currentUser: observable,
      changeCurrentUser: action
    });

    this.currentUser = user;
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
