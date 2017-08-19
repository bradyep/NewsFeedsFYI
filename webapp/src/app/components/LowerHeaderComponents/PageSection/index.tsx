import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';

export interface PageSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface PageSectionState {
  /* empty */
}

export class PageSection extends React.Component<PageSectionProps, PageSectionState> {

  constructor(props?: PageSectionProps, context?: any) {
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
      <h3>PageSection</h3>
    );
  }
}

export default PageSection;
