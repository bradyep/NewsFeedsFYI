import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';

export interface GoogleSearchSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface GoogleSearchSectionState {
  /* empty */
}

export class GoogleSearchSection extends React.Component<GoogleSearchSectionProps, GoogleSearchSectionState> {

  constructor(props?: GoogleSearchSectionProps, context?: any) {
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
      <h3>
        GoogleSearchSection
      </h3>
    );
  }
}

export default GoogleSearchSection;
