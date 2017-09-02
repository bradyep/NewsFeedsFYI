import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { Router, Route, Switch } from 'react-router';
import { Root } from './containers/Root';
import { NewsFeedsFYIApp } from './containers/NewsFeedsFYIApp';
import { UserModel, LinkModel, PageModel } from '../../../nffyi-common/models';
import { UserStore, LinkStore, PageStore } from './stores';
import { STORE_USER, STORE_LINK, STORE_PAGE } from './constants/stores';
import { REST_DOMAIN } from './constants/values';
import * as logModule from 'debug';
const log = logModule('webapp:app-index');
const error = logModule('webapp:error');

// Window Object for Debugging
(window as any).NFYI = (window as any).NFYI || {};

// enable MobX strict mode
useStrict(true);

// Get current User and place in store. Multiple Users means the requester is an admin.
// But an admin should probably never be here to begin with. 
const userStore = new UserStore();
const linkStore = new LinkStore();
const pageStore = new PageStore();
(window as any).NFYI.userStore = userStore;
(window as any).NFYI.linkStore = linkStore;
(window as any).NFYI.pageStore = pageStore;
var initialPage: number = 0;

(async () => {
  try {
    log("Get current User and place in store");
    const userResponse = await fetch(REST_DOMAIN + '/users');
    const userData: UserModel = await userResponse.json();
    log(userData);
    userStore.changeUser(userData);

    log("Get User's Links and place in store");
    const linkResponse = await fetch(REST_DOMAIN + '/links');
    const linksData: LinkModel[] = await linkResponse.json();
    log(linksData);
    linksData.map((link) => linkStore.addLink(link));

    // Just get User's first page for now
    log("Get User's Pages to place in store");
    const pagesResponse = await fetch(REST_DOMAIN + '/pages');
    const pagesData: PageModel[] = await pagesResponse.json();
    log(pagesData);
    initialPage = pagesData[0].pageID || 0;
    if (!initialPage) throw new Error("First Page's ID is undefined");

    log("Getting initial page for User");
    const pageResponse = await fetch(REST_DOMAIN + '/userfeeds/page/' + initialPage.toString());
    const pageData: PageModel = await pageResponse.json();
    log(pageData);
    pageStore.addPage(pageData);
  } catch (err) {
    error("Problem Populating Stores: " + err.toString());
  }
})();

const rootStores = {
  [STORE_USER]: userStore,
  [STORE_LINK]: linkStore,
  [STORE_PAGE]: pageStore
};

// render react DOM
ReactDOM.render(
  <Provider {...rootStores} >
    <Root>
      <NewsFeedsFYIApp />
    </Root>
  </Provider >,
  document.getElementById('root')
);
