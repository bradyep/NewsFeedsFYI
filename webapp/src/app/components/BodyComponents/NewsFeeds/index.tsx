import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';

export interface NewsFeedsProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
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

  render() {
    return (
      <h2>
        NewsFeeds
      </h2>
    );
  }
}

export default NewsFeeds;
