import { observable, action } from 'mobx';
// import { UserModel } from '../../../../nffyi-common/models';
import { UserModel } from '../models/common';

export class UserStore {

  constructor(user: UserModel) {
/*     this.todos = fixtures;
    this.addTodo = this.addTodo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.editTodo = this.editTodo.bind(this);
    this.completeAll = this.completeAll.bind(this);
    this.clearCompleted = this.clearCompleted.bind(this); */
    if (user) this.currentUser = user;
  }

  // The Primary User
  @observable
  public currentUser: UserModel;

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
