import * as React from 'react';
import { FormGroup, InputGroup, FormControl } from 'react-bootstrap';

export interface GoogleSearchSectionProps { }
export interface GoogleSearchSectionState { }

export class GoogleSearchSection extends React.Component<GoogleSearchSectionProps, GoogleSearchSectionState> {
  /*
  constructor(props: GoogleSearchSectionProps) {
    super(props);
    // this.handleSave = this.handleSave.bind(this);
  }
  */

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
