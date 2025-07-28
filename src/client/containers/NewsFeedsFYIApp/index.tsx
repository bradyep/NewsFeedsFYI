import * as React from 'react';
import styles from './styles.css';
import { inject, observer } from 'mobx-react';
import { LinkSection, ProfileSection } from 'client/components/TopHeaderComponents';
import { PageSection, GoogleSearchSection, AddNewsFeedSection  } from 'client/components/LowerHeaderComponents';
import { NewsFeeds } from 'client/components/BodyComponents';
import { Copyright } from 'client/components/FooterComponents';
import { UserStore, LinkStore, PageStore } from 'client/stores';
import { STORE_USER, STORE_LINK, STORE_PAGE } from 'client/constants/stores';
import { REST_DOMAIN } from 'client/constants/network';
import { UserModel, LinkModel, PageModel } from 'common/models';
import { Navbar } from 'react-bootstrap';
import { getCurrentUser, getLinks, getUsersPagesWithFirstPopulated } from 'client/services/api';
import debug from 'debug';
const log = debug('webapp:NewsFeedsFYIApp');
const error = debug('webapp:error');

export interface NewsFeedsFYIAppProps {
  /** MobX Stores will be injected via @inject() **/
}

// Since the names of properties cannot be derived, we cannot use our constant store names
interface InjectedProps extends NewsFeedsFYIAppProps {
  user: UserStore;
  link: LinkStore,
  page: PageStore
}

export interface NewsFeedsFYIAppState { }

@inject(STORE_USER, STORE_LINK, STORE_PAGE)
@observer
export class NewsFeedsFYIApp extends React.Component<NewsFeedsFYIAppProps, NewsFeedsFYIAppState> {

  constructor(props: NewsFeedsFYIAppProps) {
    super(props);
    this.changeCurrentUser = this.changeCurrentUser.bind(this);    
  }

  get injected() {
    return this.props as InjectedProps;
  }

  async changeCurrentUser() {
    log("Attempting to change current User");
    const userStore = this.injected[STORE_USER] as UserStore;
    const linkStore = this.injected[STORE_LINK] as LinkStore;
    const pageStore = this.injected[STORE_PAGE] as PageStore;
    
    const getUserURL = REST_DOMAIN + '/users';
    const getLinksURL = REST_DOMAIN + '/links';
    const getPagesURL = REST_DOMAIN + '/pages';
    const getPageURL = REST_DOMAIN + '/userfeeds/page/';

    let currentUser: UserModel | undefined;
    let links: LinkModel[] | undefined;
    let pagesWithfirstPopulated: PageModel[] | undefined;

    try {
      [currentUser, links, pagesWithfirstPopulated] = await Promise.all([getCurrentUser(getUserURL), getLinks(getLinksURL), getUsersPagesWithFirstPopulated(getPagesURL, getPageURL)]);
    } catch (err) {
      error("Problem Getting Data For Stores For User Change: " + err.toString());
    }

    if (currentUser) {
      userStore.changeCurrentUser(currentUser);
    } else {
      throw new Error("Could Not Get Current User for User Change");
    }
  
    linkStore.clearOutLinks();
    if (links) links.map((link) => linkStore.addLink(link));
  
    if (pagesWithfirstPopulated) {
      pageStore.setPages(pagesWithfirstPopulated);
    } else {
      throw new Error("Could Not Get First Page for User Change");    
    }
  }

  render() {
    // const { children } = this.props;
    const pageStore = this.injected[STORE_PAGE] as PageStore;

    return (
      <div style={{ paddingTop: '80px' }}>
        <Navbar variant="dark" fixed="top" className={styles.header}>
          <div className="container-fluid">
            <div className="row w-100">
              <div className="col-md-9 d-flex align-items-center">
                <h4 className="me-3 mb-0">newsfeeds.fyi</h4>
                <LinkSection linksStore={this.injected[STORE_LINK]} userStore={this.injected[STORE_USER]} />
              </div>
              <div className="col-md-3">
                <ProfileSection changeCurrentUser={this.changeCurrentUser} userStore={this.injected[STORE_USER]} />
              </div>
            </div>
          </div>
        </Navbar>

        <section className="container-fluid py-3">
          <div className="row">
            <PageSection userStore={this.injected[STORE_USER]} pageStore={this.injected[STORE_PAGE]} />
            <GoogleSearchSection />
            <AddNewsFeedSection userStore={this.injected[STORE_USER]} pageStore={this.injected[STORE_PAGE]} />
          </div>
        </section>

        <main className="container-fluid">
          <NewsFeeds pageStore={this.injected[STORE_PAGE]} userStore={this.injected[STORE_USER]} />
        </main>

        <footer className="container-fluid mt-4">
          <Copyright />
        </footer>
      </div>
    );
  }
};
