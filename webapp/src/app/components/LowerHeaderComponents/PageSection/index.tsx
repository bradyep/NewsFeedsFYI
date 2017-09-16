import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { observer } from 'mobx-react';

export interface PageSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface PageSectionState {
  /* empty */
}

@observer
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
      <div className="col-md-3">
        <p>Page: </p>
        <DropdownButton title="General News" id="1">
          <MenuItem eventKey="1" active>General News</MenuItem>
          <MenuItem eventKey="2">Development</MenuItem>
          <MenuItem eventKey="3">Design</MenuItem>
        </DropdownButton>
      </div>
    );
  }
}

export default PageSection;
