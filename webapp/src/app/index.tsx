import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { createBrowserHistory } from 'history';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
// import { Router, Route, Switch } from 'react-router';
import { Root } from './containers/Root';
// import { TodoApp } from './containers/TodoApp';
import { NewsFeedsFYIApp } from './containers/NewsFeedsFYIApp';
import { TodoModel } from './models/TodoModel';
import { TodoStore, RouterStore } from './stores';
import { STORE_TODO } from './constants/stores';
// import { TodoFilter } from './constants/todos';

// enable MobX strict mode
useStrict(true);

// default fixtures for TodoStore
const defaultTodos = [
  new TodoModel('Use Mobx'),
  new TodoModel('Use React', true),
];

// prepare MobX stores
// const history = createBrowserHistory();
const todoStore = new TodoStore(defaultTodos);
// const routerStore = new RouterStore(history);
const rootStores = {
  [STORE_TODO]: todoStore
};

// render react DOM
ReactDOM.render(
  <Provider {...rootStores} >
    <Root>
      <NewsFeedsFYIApp></NewsFeedsFYIApp>
    </Root>
  </Provider >,
  document.getElementById('root')
);
