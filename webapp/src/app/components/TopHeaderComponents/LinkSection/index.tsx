import * as React from 'react';
import * as styles from './styles.css';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';

export interface LinkSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
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
      }
    }
   */

  render() {
    return (
      <div className={styles.linkList}>
        <ol>
          <li>GMail</li>
          <li>Google Drive</li>
          <li>Facebook</li>
          <li>
            <i className="fa fa-cog" aria-hidden="true"></i>
          </li>
        </ol>
      </div>
    );
  }
}

export default LinkSection;
