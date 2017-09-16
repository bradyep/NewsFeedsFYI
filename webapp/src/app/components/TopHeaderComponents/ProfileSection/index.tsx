import * as React from 'react';
import * as styles from './styles.css';
import { Modal, Button, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import { REST_DOMAIN } from '../../../constants/network';
import { UserModel } from '../../../../../../nffyi-common/models';
import * as logModule from 'debug';
const log = logModule('webapp:ProfileSection');
const error = logModule('webapp:error');
import { observer } from 'mobx-react';

export interface ProfileSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
  changeCurrentUser: () => void
}

export interface ProfileSectionState {
  showModal: boolean;
  username: string;
  password: string;
  confirmPassword: string;
}

@observer
export class ProfileSection extends React.Component<ProfileSectionProps, ProfileSectionState> {

  constructor(props?: ProfileSectionProps, context?: any) {
    super(props, context);
    this.state = {
      showModal: false, username: "", password: "", confirmPassword: ""
    };
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.attemptSignIn = this.attemptSignIn.bind(this);
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
    // console.log("Hey! " + this.state.showModal.toString());
  }

  handleChange(e:any) {
    // log("Need to change: " + e.currentTarget.id + " to: " + e.currentTarget.value);
    this.setState({[e.currentTarget.id]: e.currentTarget.value});
  }

  async attemptSignIn() {
      try {
        const url = REST_DOMAIN + '/authenticate';
        const authenticationResponse = await fetch(url, {  
          credentials: "include",
          method: "post",  
          headers: {  
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
          },  
          body: "username=" + this.state.username + "&password=" + this.state.password
        });

        const userData: UserModel = await authenticationResponse.json();
        // const text: string = await authenticationResponse.text();
        log("Authentication Attempt Returned: ");
        log(userData);
        // log("Authentication Attempt Returned: " + text);
        this.props.changeCurrentUser();
      } catch (err) {
        error("Error while trying to authenticate: " + err);
      }
  }

  renderSignInModal() {
    return (
      <div className="static-modal" >
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header>
            <Modal.Title>Sign In to newsfeeds.fyi</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <FormGroup controlId="username">
                <ControlLabel>Username: </ControlLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="Username" />
              </FormGroup>
              <FormGroup controlId="password">
                <ControlLabel>Password: </ControlLabel>
                <FormControl onChange={this.handleChange} type="password" placeholder="Password" />
              </FormGroup>
              <FormGroup controlId="confirmPassword">
                <ControlLabel>Confirm Password: </ControlLabel>
                <FormControl onChange={this.handleChange} type="password" placeholder="Confirm Password" />
              </FormGroup>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.close}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.attemptSignIn}>Sign In</Button>
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
