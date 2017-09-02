import * as React from 'react';
import * as styles from './styles.css';
import { inject, observer } from 'mobx-react';
import { LinkSection, ProfileSection } from '../../components/TopHeaderComponents';
import { PageSection, GoogleSearchSection, AddNewsFeedSection  } from '../../components/LowerHeaderComponents';
import { NewsFeeds } from '../../components/BodyComponents';
import { Copyright } from '../../components/FooterComponents';
import { UserStore, LinkStore, PageStore } from '../../stores';
import { STORE_USER, STORE_LINK, STORE_PAGE } from '../../constants/stores';
import { Navbar } from 'react-bootstrap';

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
  }

  get injected() {
    return this.props as InjectedProps;
  }

  componentDidMount() {

  }

  render() {
    const { children } = this.props;

    return (
      <div>
        <Navbar inverse staticTop className={styles.header}>
          <Navbar.Header>
            <div className="container">
              <div className="row">
                <div className="col-md-9">
                  <h4>newsfeeds.fyi</h4>
                  <LinkSection></LinkSection>
                </div>
                <div className="col-md-3">
                  <ProfileSection></ProfileSection>
                </div>
              </div>

            </div>
          </Navbar.Header>
        </Navbar>

        <section className="container">
          <div className="row">
            <PageSection></PageSection>
            <GoogleSearchSection></GoogleSearchSection>
            <AddNewsFeedSection></AddNewsFeedSection>
          </div>
        </section>

        <main className="container">
          <NewsFeeds></NewsFeeds>
        </main>

        <footer className="container">
          <Copyright></Copyright>
        </footer>
      </div>
    );
  }
};
