import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { Router, Route, Switch } from 'react-router';
import { Root } from './containers/Root';
// import { TodoApp } from './containers/TodoApp';
import { NewsFeedsFYIApp } from './containers/NewsFeedsFYIApp';
import { TodoModel } from './models/TodoModel';
import { TodoStore, RouterStore, UserStore, LinkStore, PageStore } from './stores';
import { STORE_TODO, STORE_ROUTER, STORE_USER, STORE_LINK, STORE_PAGE } from './constants/stores';
// import { TodoFilter } from './constants/todos';
import { Footer } from './components/Footer';
import * as logModule from 'debug';
  const log = logModule('webapp:app-index');
// import errorModule = require('debug');
// const error = logModule('nffyi-rest:error');

// enable MobX strict mode
useStrict(true);

// default fixtures for TodoStore
const defaultTodos = [
  new TodoModel('Use Mobx'),
  new TodoModel('Use React', true),
];

// prepare MobX stores
const history = createBrowserHistory();
const todoStore = new TodoStore(defaultTodos);
const routerStore = new RouterStore(history);

// Get current User and place in store. Multiple Users means the requester is an admin.
log("Get current User and place in store");
fetch('http://localhost:3000/users') 
  .then((response) => response.json())
  .then((user) => log(user));
/* 
  .then((posts) => this.setState({
    posts: posts,
  }));
    */
const userStore = new UserStore();

const linkStore = new LinkStore();
const pageStore = new PageStore();

const rootStores = {
  [STORE_TODO]: todoStore,
  [STORE_ROUTER]: routerStore,
  [STORE_USER]: userStore,
  [STORE_LINK]: linkStore,
  [STORE_PAGE]: pageStore,
};

// render react DOM
ReactDOM.render(
  <Provider {...rootStores} >
    <Root>
      <Router history={history} >
        <Switch>
          <Route path="/" component={NewsFeedsFYIApp} />
        </Switch>
      </Router>
    </Root>
  </Provider >,
  document.getElementById('root')
);

/* 
ReactDOM.render(
  <Provider {...rootStores} >
    <Root>
      <NewsFeedsFYIApp></NewsFeedsFYIApp>
    </Root>
  </Provider >,
  document.getElementById('root')
);
 */
