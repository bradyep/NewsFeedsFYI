import * as React from 'react';
import * as styles from './styles.css';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';
import { Modal, Button } from "react-bootstrap";

export interface ProfileSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface ProfileSectionState {
  showModal: boolean;
}

export class ProfileSection extends React.Component<ProfileSectionProps, ProfileSectionState> {

  constructor(props?: ProfileSectionProps, context?: any) {
    super(props, context);
    // this.handleSave = this.handleSave.bind(this);
    this.state = {
      showModal: false
    };
    this.close = this.close.bind(this); 
    this.open = this.open.bind(this); 
    this.displayModal = this.displayModal.bind(this); 
    this.renderSignInModal = this.renderSignInModal.bind(this); 
    this.render = this.render.bind(this); 
  }

  /*   
    handleSave(text: string) {
      if (text.length) {
        this.props.addTodo({ text });
      }
    }
     */

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
    console.log("Hey! " + this.state.showModal.toString());
  }

  displayModal(show: boolean): void {
    this.setState({ showModal: show })
  }

  renderSignInModal() {
    return (
      <div className="static-modal" >
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header>
            <Modal.Title>Modal title</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            One fine body...
        </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
            <Button bsStyle="primary">Save changes</Button>
          </Modal.Footer>

        </Modal>
      </div>
    )
  }

  render() {
    return (
      <div className={styles.profileSection} onClick={this.open}>
        {this.renderSignInModal()}
        <i className="fa fa-user fa-2x" aria-hidden="true"></i>
        <p>
          Sign In To Customize
        </p>
      </div>
    );
  }
}

export default ProfileSection;
