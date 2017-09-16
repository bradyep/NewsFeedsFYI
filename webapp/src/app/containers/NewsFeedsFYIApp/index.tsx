import * as React from 'react';
import * as styles from './styles.css';
import { inject, observer } from 'mobx-react';
import { LinkSection, ProfileSection } from '../../components/TopHeaderComponents';
import { PageSection, GoogleSearchSection, AddNewsFeedSection  } from '../../components/LowerHeaderComponents';
import { NewsFeeds } from '../../components/BodyComponents';
import { Copyright } from '../../components/FooterComponents';
import { UserStore, LinkStore, PageStore } from '../../stores';
import { STORE_USER, STORE_LINK, STORE_PAGE } from '../../constants/stores';
import { REST_DOMAIN } from '../../constants/network';
import { UserModel, LinkModel, PageModel } from '../../../../../nffyi-common/models';
import { Navbar } from 'react-bootstrap';
import * as logModule from 'debug';
const log = logModule('webapp:NewsFeedsFYIApp');
const error = logModule('webapp:error');
import { getCurrentUser, getLinks, getUsersFirstPage } from "../../index";

export interface NewsFeedsFYIAppProps {
  /** MobX Stores will be injected via @inject() **/
}

// Since the names of properties cannot be derived, we cannot use our constant store names
interface InjectedProps extends NewsFeedsFYIAppProps {
  user: UserStore;
  link: LinkStore,
  page: PageStore
}

export interface NewsFeedsFYIAppState {
  // empty
}

@inject(STORE_USER, STORE_LINK, STORE_PAGE)
@observer
export class NewsFeedsFYIApp extends React.Component<NewsFeedsFYIAppProps, NewsFeedsFYIAppState> {

  constructor(props: NewsFeedsFYIAppProps, context: any) {
    super(props, context);
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
    let firstPage: PageModel | undefined;

    try {
      [currentUser, links, firstPage] = await Promise.all([getCurrentUser(getUserURL), getLinks(getLinksURL), getUsersFirstPage(getPagesURL, getPageURL)]);
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
  
    if (firstPage) {
      pageStore.setPages([firstPage]);
    } else {
      throw new Error("Could Not Get First Page for User Change");    
    }
  }

  render() {
    // const { children } = this.props;
    const pageStore = this.injected[STORE_PAGE] as PageStore;

    return (
      <div>
        <Navbar inverse staticTop className={styles.header}>
          <Navbar.Header>
            <div className="container">
              <div className="row">
                <div className="col-md-9">
                  <h4>newsfeeds.fyi</h4>
                  <LinkSection linksStore={this.injected[STORE_LINK]} userStore={this.injected[STORE_USER]} />
                </div>
                <div className="col-md-3">
                  <ProfileSection changeCurrentUser={this.changeCurrentUser} userStore={this.injected[STORE_USER]} />
                </div>
              </div>

            </div>
          </Navbar.Header>
        </Navbar>

        <section className="container">
          <div className="row">
            <PageSection />
            <GoogleSearchSection />
            <AddNewsFeedSection userStore={this.injected[STORE_USER]} />
          </div>
        </section>

        <main className="container">
          <NewsFeeds pageStore={this.injected[STORE_PAGE]} />
        </main>

        <footer className="container">
          <Copyright />
        </footer>
      </div>
    );
  }
};
