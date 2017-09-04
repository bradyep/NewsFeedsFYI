import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { createBrowserHistory } from 'history';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
// import { Router, Route, Switch } from 'react-router';
import { Root } from './containers/Root';
import { NewsFeedsFYIApp } from './containers/NewsFeedsFYIApp';
import { UserModel, LinkModel, PageModel, UserFeedModel } from '../../../nffyi-common/models';
import { UserStore, LinkStore, PageStore } from './stores';
import { STORE_USER, STORE_LINK, STORE_PAGE } from './constants/stores';
import { REST_DOMAIN } from './constants/network';
import * as logModule from 'debug';
const log = logModule('webapp:app-index');
const error = logModule('webapp:error');

// Window Object for Debugging
(window as any).NFYI = (window as any).NFYI || {};

// enable MobX strict mode
useStrict(true);

const userStore = new UserStore();
const linkStore = new LinkStore();
const pageStore = new PageStore();
(window as any).NFYI.userStore = userStore;
(window as any).NFYI.linkStore = linkStore;
(window as any).NFYI.pageStore = pageStore;

async function getCurrentUser(url: string): Promise<UserModel | undefined> {
  try {
    log("Getting current User");
    const userResponse = await fetch(url);
    const userData: UserModel = await userResponse.json();
    log(userData);

    return userData;
  } catch (err) {
    error("Problem Getting current User: " + err.toString());
    return undefined;
  }
}

async function getLinks(url: string): Promise<LinkModel[] | undefined> {
  try {
    log("Getting User's Links");
    const linkResponse = await fetch(url);
    const linksData: LinkModel[] = await linkResponse.json();
    log(linksData);

    return linksData;
  } catch (err) {
    error("Problem Getting Links: " + err.toString());
    return undefined;
  }
}

async function getUsersFirstPage(pagesURL: string, pageURL: string): Promise<PageModel | undefined> {
  try {
    log("Getting User's Pages");
    const pagesResponse = await fetch(pagesURL);
    const pagesData: PageModel[] = await pagesResponse.json();
    log(pagesData);
    let initialPage = pagesData[0];
    if (!initialPage.pageID) throw new Error("First Page's ID is undefined");

    log("Getting initial page UserFeeds for User");
    const userFeedsResponse = await fetch(pageURL + initialPage.pageID.toString());
    const userFeedsData: UserFeedModel[] = await userFeedsResponse.json();
    log(userFeedsData);

    // Assemble Initial Page
    initialPage.userFeeds = userFeedsData;

    return initialPage;
  } catch (err) {
    error("Problem Getting First Page: " + err.toString());
    return undefined;
  }
}

(async () => {
  const getUserURL = REST_DOMAIN + '/users';
  const getLinksURL = REST_DOMAIN + '/links';
  const getPagesURL = REST_DOMAIN + '/pages';
  const getPageURL = REST_DOMAIN + '/userfeeds/page/';
  
  let currentUser: UserModel | undefined;
  let links: LinkModel[] | undefined;
  let firstPage: PageModel | undefined;

  try {
    [currentUser, links, firstPage] = await Promise.all([getCurrentUser(getUserURL), getLinks(getLinksURL), getUsersFirstPage(getPagesURL, getPageURL)]);
    
    if (currentUser) userStore.changeCurrentUser(currentUser);
    if (links) links.map((link) => linkStore.addLink(link));
    if (firstPage) pageStore.addPage(firstPage);
  } catch (err) {
    error("Problem Setting Data For Stores: " + err.toString());
  }

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
})();
