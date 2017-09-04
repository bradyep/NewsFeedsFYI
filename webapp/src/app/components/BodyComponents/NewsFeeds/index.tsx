import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';
import * as styles from './styles.css';
import { PageStore } from '../../../stores';
import { UserFeedModel } from "../../../../../../nffyi-common/models";

export interface NewsFeedsProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
  pageStore: PageStore
}

export interface NewsFeedsState {
  /* empty */
}

export class NewsFeeds extends React.Component<NewsFeedsProps, NewsFeedsState> {

  constructor(props?: NewsFeedsProps, context?: any) {
    super(props, context);
    // this.handleSave = this.handleSave.bind(this);
  }

  /* 
    handleSave(text: string) {
      if (text.length) {
        this.props.addTodo({ text });
      }
    }
   */

  renderNewsFeed(userFeedModel: UserFeedModel, key: number) {
    return (
      <div className={styles.newsSection} key={key} >
        <div className={styles.newsSectionHeader}>
          <h4 className={styles.feedHeader}>
            <a href="#" target="_blank">{userFeedModel.name}</a>
          </h4>
        </div>
        <div className={styles.newsSectionHeaderContent}>
          <ul>
            {userFeedModel.newsItems.map(newsItem => 
              <li className={styles.newsFeedItem}>
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
    const { activePage } = pageStore;
    const userFeeds = activePage.userFeeds.filter(uf => uf.column === column);

    return (
      <div className={`col-md-4 ${styles.newsSectionContainer}`}>
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
