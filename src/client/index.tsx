// Ignore the fact that this is grayed out in VSCode, we need this import
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Configure MobX for v6+ compatibility
import { configure } from 'mobx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { Provider } from 'mobx-react';
import { Root } from './containers/Root';
import { NewsFeedsFYIApp } from './containers/NewsFeedsFYIApp';
import { UserModel, LinkModel, PageModel, UserFeedModel } from '../common/models';
import { UserStore, LinkStore, PageStore } from './stores';
import { STORE_USER, STORE_LINK, STORE_PAGE } from './constants/stores';
import { REST_DOMAIN } from './constants/network';
import { getCurrentUser, getLinks, getUsersPagesWithFirstPopulated } from './services/api';
import debug from 'debug';
const log = debug('webapp:app-index');
const error = debug('webapp:error');

// Configure MobX for modern compatibility
configure({
  enforceActions: "never",
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: true
});

(async () => {
  const getUserURL = REST_DOMAIN + '/users';
  const getLinksURL = REST_DOMAIN + '/links';
  const getPagesURL = REST_DOMAIN + '/pages';
  const getPageURL = REST_DOMAIN + '/userfeeds/page/';
  
  let currentUser: UserModel | undefined;
  let links: LinkModel[] | undefined;
  let pagesWithfirstPopulated: PageModel[] | undefined;

  try {
    log("Attempting to get current User");
    [currentUser, links, pagesWithfirstPopulated] = await Promise.all([getCurrentUser(getUserURL), getLinks(getLinksURL), getUsersPagesWithFirstPopulated(getPagesURL, getPageURL)]);
  } catch (err) {
    error("Problem Getting Data For Stores: " + err.toString());
  }

  let rootStores = { };

  if (currentUser) {
    const userStore = new UserStore(currentUser);
    rootStores = { ...rootStores, [STORE_USER]: userStore };
  } else {
    throw new Error("Could Not Get Current User");
  }

  const linkStore = new LinkStore();
  if (links) links.map((link) => linkStore.addLink(link));
  rootStores = { ...rootStores, [STORE_LINK]: linkStore };

  if (pagesWithfirstPopulated) {
    const pageStore = new PageStore(pagesWithfirstPopulated);
    rootStores = { ...rootStores, [STORE_PAGE]: pageStore };    
  } else {
    throw new Error("Could Not Get First Page");    
  }
  
  // render react DOM
  const container = document.getElementById('root');
  if (!container) throw new Error('Root container not found');
  
  const root = ReactDOM.createRoot(container);
  root.render(
    <Provider {...rootStores} >
      <Root>
        <NewsFeedsFYIApp />
      </Root>
    </Provider>
  );
})();
