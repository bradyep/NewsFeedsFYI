import * as React from 'react';
import { FormGroup, InputGroup, FormControl } from 'react-bootstrap';

export interface GoogleSearchSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface GoogleSearchSectionState {
  /* empty */
}

export class GoogleSearchSection extends React.Component<GoogleSearchSectionProps, GoogleSearchSectionState> {

  constructor(props: GoogleSearchSectionProps, context?: any) {
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
      <div className="col-md-7">
        <form>
          <FormGroup>
            <InputGroup>
              <FormControl type="text" />
              <InputGroup.Text>
                <i className="fa fa-search" aria-hidden="true"></i>
              </InputGroup.Text>
            </InputGroup>
          </FormGroup>
        </form>
      </div>
    );
  }
}

export default GoogleSearchSection;
