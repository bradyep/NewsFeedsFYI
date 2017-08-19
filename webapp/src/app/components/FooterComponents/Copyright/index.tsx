import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';

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
    return (
      <h2>
        Copyright
      </h2>
    );
  }
}

export default Copyright;
