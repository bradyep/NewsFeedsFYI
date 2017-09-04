import * as React from 'react';
import * as styles from './styles.css';
import { LinkStore, UserStore } from '../../../stores';
import { STORE_LINK } from '../../../constants/stores';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';

export interface LinkSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
  linksStore: LinkStore,
  userStore: UserStore
}

export interface LinkSectionState {
  /* empty */
}

export class LinkSection extends React.Component<LinkSectionProps, LinkSectionState> {

  constructor(props?: LinkSectionProps, context?: any) {
    super(props, context);
    // this.handleSave = this.handleSave.bind(this);
  }

  /*   
    handleSave(text: string) {
      if (text.length) {
        this.props.addTodo({ text });
      }]
    }
   */

  render() {
    const { linksStore } = this.props;
    const { links } = linksStore;

    return (
      <div className={styles.linkList}>
        <ol>
          {links.map(link =>
            <li key={link.linkID}>
              <a href={link.url} target="_blank">{link.name}</a>
            </li>
          )}
          <li>
            <i className="fa fa-cog" aria-hidden="true"></i>
          </li>
        </ol>
      </div>
    );
  }
}

export default LinkSection;
