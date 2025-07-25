import * as React from 'react';
import * as styles from './styles.css';
import { PageStore, UserStore } from 'client/stores';
import { UserFeedModel } from 'common/models';
import { Roles } from 'common/constants';
import { observer } from 'mobx-react';

export interface NewsFeedsProps {
  pageStore: PageStore,
  userStore: UserStore
}

export interface NewsFeedsState {
  /* empty */
}

@observer
export class NewsFeeds extends React.Component<NewsFeedsProps, NewsFeedsState> {

  /*
  constructor(props: NewsFeedsProps) {
    super(props);
    // this.handleSave = this.handleSave.bind(this);
  }
  */

  /* 
    handleSave(text: string) {
      if (text.length) {
        this.props.addTodo({ text });
      }
    }
   */

  renderNewsFeed(userFeedModel: UserFeedModel, key: number) {
    const { userStore } = this.props;
    const { currentUser } = userStore;
    const displayedNewsItems = userFeedModel.newsItems ? userFeedModel.newsItems.slice(0, userFeedModel.itemDisplayCount) : [];

    return (
      <div className={styles.newsSection} key={key} >
        <div className={styles.newsSectionHeader}>
          <h4 className={styles.feedHeader}>
            {currentUser.roleID != Roles.GUEST &&
              <span>
                <i className={`fa fa-ellipsis-v ${styles.badGrippyBar}`} aria-hidden="true"></i>
                <i className={`fa fa-ellipsis-v ${styles.badGrippyBar}`} aria-hidden="true"></i>
              </span>
            }
            <a href={userFeedModel.titleURL} target="_blank" className={styles.titleURL}>{userFeedModel.name}</a>
            {currentUser.roleID != Roles.GUEST &&
              <i className={`fa fa-cog ${styles.settings}`} aria-hidden="true"></i>
            }
          </h4>
        </div>
        <div className={styles.newsSectionHeaderContent}>
          <ul>
            {displayedNewsItems.map((newsItem, i) =>
              <li key={i} className={styles.newsFeedItem}>
                <a href={newsItem.link} target="_blank">{newsItem.title}</a>
              </li>
            )}
          </ul>
        </div>
      </div >
    )
  }

  renderNewsFeedColumn(column: number) {
    const { pageStore } = this.props;
    const { currentlyDisplayedPage } = pageStore;
    const userFeeds: UserFeedModel[] = currentlyDisplayedPage.userFeeds.filter((uf: UserFeedModel) => uf.column === column);

    return (
      <div className={`col-sm-4 ${styles.newsSectionContainer}`}>
        {userFeeds.map((newsFeed, i) =>
          this.renderNewsFeed(newsFeed, i)
        )}
      </div>
    );
  }

  render() {
    return (
      <div className="allNews">
        <div className="row">
          {this.renderNewsFeedColumn(1)}
          {this.renderNewsFeedColumn(2)}
          {this.renderNewsFeedColumn(3)}
        </div>
      </div>
    );
  }
}

export default NewsFeeds;
