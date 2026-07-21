import * as React from 'react';
import styles from './styles.css';
import { PageStore, UserStore } from 'client/stores';
import { UserFeedModel } from 'common/models';
import { Roles } from 'common/constants';
import { observer } from 'mobx-react';
import debug from 'debug';
const log = debug('webapp:NewsFeeds');

export interface NewsFeedsProps {
  pageStore: PageStore,
  userStore: UserStore
}

export interface NewsFeedsState { }

class NewsFeeds extends React.Component<NewsFeedsProps, NewsFeedsState> {

  renderNewsFeed(userFeedModel: UserFeedModel, key: number) {
    const { userStore } = this.props;
    const { pageStore } = this.props;
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
              <i className={`fa fa-cog ${styles.settings}`}
                onClick={
                  () => this.props.pageStore.setUserFeedBeingEdited({ userFeedID: userFeedModel.userFeedID, pageID: userFeedModel.pageID, name: userFeedModel.name, itemDisplayCount: userFeedModel.itemDisplayCount, feedSourceUrl: undefined, feedSourceID: userFeedModel.feedSourceID, column: userFeedModel.column, row: userFeedModel.row, isEditing: true })
                } aria-hidden="true"></i>
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
    if (!currentlyDisplayedPage.userFeeds) { throw new Error('No user feeds available for the currently displayed page'); }
    log(`Rendering news feed column: ${column} for page: ${currentlyDisplayedPage.pageID} | Number of feeds: ${currentlyDisplayedPage.userFeeds.length}`);
    const userFeeds: UserFeedModel[] = currentlyDisplayedPage.userFeeds.filter((uf: UserFeedModel) => uf.column === column);

    return (
      <div className={`col-md-4 mb-3 ${styles.newsSectionContainer}`}>
        {userFeeds.map((newsFeed, i) =>
          this.renderNewsFeed(newsFeed, i)
        )}
      </div>
    );
  }

  render() {
    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#fce4ec', padding: '8px' } : {};

    return (
      <div className="allNews" style={debugStyle}>
        <div className="row g-3">
          {this.renderNewsFeedColumn(1)}
          {this.renderNewsFeedColumn(2)}
          {this.renderNewsFeedColumn(3)}
        </div>
      </div>
    );
  }
}

const ObservedNewsFeeds = observer(NewsFeeds);
export { ObservedNewsFeeds as NewsFeeds };
export default ObservedNewsFeeds;
