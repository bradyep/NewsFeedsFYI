import * as React from 'react';
import * as styles from './styles.css';
import { inject, observer } from 'mobx-react';
// import { RouteComponentProps } from 'react-router';
import { LinkSection, ProfileSection } from '../../components/TopHeaderComponents';
import { PageSection, GoogleSearchSection, AddNewsFeedSection  } from '../../components/LowerHeaderComponents';
import { NewsFeeds } from '../../components/BodyComponents';
import { Copyright } from '../../components/FooterComponents';
import { TodoList } from '../../components/TodoList';
import { Footer } from '../../components/Footer';
import { TodoModel } from '../../models/TodoModel';
import { TodoStore, RouterStore } from '../../stores';
import { STORE_TODO, STORE_ROUTER, STORE_USER, STORE_LINK, STORE_PAGE } from '../../constants/stores';
import { TodoFilter, TODO_FILTER_LOCATION_HASH } from '../../constants/todos';
import { Navbar } from 'react-bootstrap';

export interface NewsFeedsFYIAppProps {
  /** MobX Stores will be injected via @inject() **/
  // [STORE_TODO]: todoStore,
  // [STORE_ROUTER]: routerStore,
  // [STORE_USER]: userStore,
  // [STORE_LINK]: linkStore,
  // [STORE_PAGE]: pageStore
  [store: string]: any
}

export interface NewsFeedsFYIAppState {
  // filter: TodoFilter;
}

@inject(STORE_TODO, STORE_ROUTER, STORE_USER, STORE_LINK, STORE_PAGE)
@observer
export class NewsFeedsFYIApp extends React.Component<NewsFeedsFYIAppProps, NewsFeedsFYIAppState> {

  constructor(props: NewsFeedsFYIAppProps, context: any) {
    super(props, context);
  }

  componentDidMount() {
    // console.log("Hey!");
  }

  render() {
    const todoStore = this.props[STORE_TODO] as TodoStore;
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
