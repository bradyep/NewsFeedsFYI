import * as React from 'react';
import * as styles from './styles.css';
import { inject, observer } from 'mobx-react';
// import { RouteComponentProps } from 'react-router';
import { LinkSection, ProfileSection } from '../../components/TopHeaderComponents';
import { TodoList } from '../../components/TodoList';
import { Footer } from '../../components/Footer';
import { TodoModel } from '../../models/TodoModel';
import { TodoStore, RouterStore } from '../../stores';
import { STORE_TODO, STORE_ROUTER } from '../../constants/stores';
import { TodoFilter, TODO_FILTER_LOCATION_HASH } from '../../constants/todos';

export interface NewsFeedsFYIAppProps {
  /** MobX Stores will be injected via @inject() **/
  // [STORE_ROUTER]: RouterStore;
  // [STOURE_TODO]: TodoStore;
}

export interface NewsFeedsFYIAppState {
  // filter: TodoFilter;
}

@inject(STORE_TODO, STORE_ROUTER)
@observer
export class NewsFeedsFYIApp extends React.Component<NewsFeedsFYIAppProps, NewsFeedsFYIAppState> {

  constructor(props: NewsFeedsFYIAppProps, context: any) {
    super(props, context);
    this.state = { filter: TodoFilter.ALL };
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentWillMount() {
    this.checkLocationChange();
  }

  componentWillReceiveProps(nextProps: NewsFeedsFYIAppProps, nextContext: any) {
    this.checkLocationChange();
  }

  checkLocationChange() {
    const router = this.props[STORE_ROUTER] as RouterStore;
    const filter = Object.keys(TODO_FILTER_LOCATION_HASH)
      .map((key) => Number(key) as TodoFilter)
      .find((filter) => TODO_FILTER_LOCATION_HASH[filter] === router.location.hash);
    this.setState({ filter });
  }

  handleFilter(filter: TodoFilter) {
    const router = this.props[STORE_ROUTER] as RouterStore;
    const currentHash = router.location.hash;
    const nextHash = TODO_FILTER_LOCATION_HASH[filter];
    if (currentHash !== nextHash) {
      router.replace(nextHash);
    }
  }

  getFilteredTodo(filter: TodoFilter) {
    const todoStore = this.props[STORE_TODO] as TodoStore;
    switch (filter) {
      case TodoFilter.ACTIVE: return todoStore.activeTodos;
      case TodoFilter.COMPLETED: return todoStore.completedTodos;
      default: return todoStore.todos;
    }
  }

  render() {
    const todoStore = this.props[STORE_TODO] as TodoStore;
    const { children } = this.props;
    // const { filter } = this.state;
    // const filteredTodos = this.getFilteredTodo(filter);

    /* 
    const footer = todoStore.todos.length ? (
      <Footer filter={filter}
        activeCount={todoStore.activeTodos.length}
        completedCount={todoStore.completedTodos.length}
        onClearCompleted={todoStore.clearCompleted}
        onChangeFilter={this.handleFilter} />
      ) : undefined;
*/

    return (
      <div className={styles.normal} >
{/*         
        <TodoList todos={filteredTodos}
          completeAll={todoStore.completeAll}
          deleteTodo={todoStore.deleteTodo}
          editTodo={todoStore.editTodo} />
        {footer}
        {children}
 */}
      </div>
    );
  }
};
