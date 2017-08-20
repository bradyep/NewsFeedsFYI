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

 renderNewsFeedColumn() {
   return (
    <div className="col-md-4 newsSectionContainer">
    {/* @foreach (var nf in columnOneFeeds) */}
      <div className="newsSection">
        <div className="newsSectionHeader">
          {/* <h4 className="feedHeader">@Html.HtmlLink(nf.Link, nf.Title, new { @target = "_blank" })</h4> */}
          <h4 className="feedHeader">TitleLink</h4>
        </div>
        <div className="newsSectionHeaderContent">
          <ul>
            <li>News Feed Item Link</li>
            <li>News Feed Item Link</li>
            <li>News Feed Item Link</li>
{/*             
            @for (int i = 0; i < nf.NewsItems.Count; i++)
            {
                @Html.HtmlLink(nf.NewsItems[i].Link, "<li>" + nf.NewsItems[i].Title + "</li>", new { @class = "newsFeedItem", @target = "_blank" }) 
            }
             */}
          </ul>
        </div>
      </div> 
    </div> 
   );
 }

  render() {
    return (
      <div className="allNews">
        <div className="row">
          {this.renderNewsFeedColumn()}
          {this.renderNewsFeedColumn()}
          {this.renderNewsFeedColumn()}
        </div>
      </div>
    );
  }
}

export default NewsFeeds;
