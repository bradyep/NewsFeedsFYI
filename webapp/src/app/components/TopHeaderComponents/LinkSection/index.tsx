import * as React from 'react';
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
        <h3>LinkSection</h3>
    );
  }
}

export default LinkSection;
