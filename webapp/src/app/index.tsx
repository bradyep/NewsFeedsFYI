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
import { UserModel, LinkModel, PageModel } from '../../../nffyi-common/models';
import { TodoStore, RouterStore, UserStore, LinkStore, PageStore } from './stores';
import { STORE_TODO, STORE_ROUTER, STORE_USER, STORE_LINK, STORE_PAGE } from './constants/stores';
import { REST_DOMAIN } from './constants/values';
// import { TodoFilter } from './constants/todos';
import { Footer } from './components/Footer';
import * as logModule from 'debug';
const log = logModule('webapp:app-index');
// import errorModule = require('debug');
// const error = logModule('nffyi-rest:error');

// Window Object for Debugging
(window as any).NFYI = (window as any).NFYI || {};

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
// But an admin should probably never be here to begin with. 
const userStore = new UserStore();
(window as any).NFYI.userStore = userStore;
log("Get current User and place in store");
fetch(REST_DOMAIN + '/users')
  .then((response) => response.json())
  .then((user: UserModel) => {
    log(user);
    userStore.changeUser(user);
  });

const linkStore = new LinkStore();
(window as any).NFYI.linkStore = linkStore;
log("Get User's Links and place in store");
fetch(REST_DOMAIN + '/links')
  .then((response) => response.json())
  .then((links: LinkModel[]) => {
    log(links);
    links.map((link) => linkStore.addLink(link));
  });

// Just get User's first page for now
const pageStore = new PageStore();
var initialPage:number = 0;
(window as any).NFYI.pageStore = pageStore;
log("Get User's Pages to place in store");
fetch(REST_DOMAIN + '/pages')
  .then((response) => response.json())
  .then((pages: PageModel[]) => {
    log(pages);
    initialPage = pages[0].pageID;

    log("Getting initial page for User");
    log("REST_DOMAIN: " + REST_DOMAIN);
    fetch(REST_DOMAIN + '/userfeeds/page/' + initialPage.toString())
      .then((response) => response.json())
      .then((page: PageModel) => {
        log(page);
        pageStore.addPage(page);
      });
  });

const rootStores = {
  [STORE_TODO]: todoStore,
  [STORE_ROUTER]: routerStore,
  [STORE_USER]: userStore,
  // [STORE_LINK]: linkStore,
  // [STORE_PAGE]: pageStore,
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
