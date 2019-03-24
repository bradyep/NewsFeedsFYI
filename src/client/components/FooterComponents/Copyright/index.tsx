import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';
import * as styles from './styles.css';

export interface CopyrightProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface CopyrightState {
  /* empty */
}

export class Copyright extends React.Component<CopyrightProps, CopyrightState> {

  constructor(props?: CopyrightProps, context?: any) {
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
    const copyrightYear:string = new Date().getFullYear().toString();

    return (
      <div className={styles.footer}>
        <p>&copy; Syntonic Studios {copyrightYear}</p>
      </div>
    );
  }
}

export default Copyright;
