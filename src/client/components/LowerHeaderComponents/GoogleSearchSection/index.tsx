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
    const debugStyle = process.env.NODE_ENV === 'development' ? { backgroundColor: '#f3e5f5', padding: '8px' } : {};
    
    return (
      <div className="col-md-6 mb-2" style={debugStyle}>
        <form>
          <InputGroup size="sm">
            <FormControl type="text" placeholder="Search..." />
            <InputGroup.Text>
              <i className="fa fa-search" aria-hidden="true"></i>
            </InputGroup.Text>
          </InputGroup>
        </form>
      </div>
    );
  }
}

export default GoogleSearchSection;
