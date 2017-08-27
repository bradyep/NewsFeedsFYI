import { observable, action } from 'mobx';
import { UserModel } from '../../../../nffyi-common/models';

export class UserStore {

  constructor(fixtures?: UserModel[]) {
/*     this.todos = fixtures;
    this.addTodo = this.addTodo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.editTodo = this.editTodo.bind(this);
    this.completeAll = this.completeAll.bind(this);
    this.clearCompleted = this.clearCompleted.bind(this); */
    if (fixtures) this.user = fixtures[0];
  }

  // The Primary User
  @observable
  public user: UserModel;

  // All Users, Not Implemented Yet
/* 
  @observable
  public users: Array<UserModel>;
 */

  /** Change Primary User in User Store. Used when a User creates an account. */
  @action
  changeUser(user:UserModel): void {
    this.user = user;
  }

}

export default UserStore;
