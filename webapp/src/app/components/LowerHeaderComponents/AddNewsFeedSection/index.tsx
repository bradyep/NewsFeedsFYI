import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';
import { FormGroup, InputGroup, Button } from 'react-bootstrap';

export interface AddNewsFeedSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface AddNewsFeedSectionState {
  /* empty */
}

export class AddNewsFeedSection extends React.Component<AddNewsFeedSectionProps, AddNewsFeedSectionState> {

  constructor(props?: AddNewsFeedSectionProps, context?: any) {
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
      <div className="col-md-2">
        <Button bsStyle="primary">Add News Feed</Button>
      </div>
    );
  }
}

export default AddNewsFeedSection;
