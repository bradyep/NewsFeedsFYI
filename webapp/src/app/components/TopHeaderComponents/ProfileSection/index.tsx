import * as React from 'react';
import * as styles from './styles.css';
import { Modal, Button, FormGroup, ControlLabel, FormControl, OverlayTrigger, Popover } from "react-bootstrap";
import { REST_DOMAIN } from '../../../constants/network';
import { UserModel } from '../../../../../../nffyi-common/models';
import { Roles, ROLE_DB_NAMES } from '../../../../../../nffyi-common/constants/roles';
import * as logModule from 'debug';
const log = logModule('webapp:ProfileSection');
const error = logModule('webapp:error');
import { observer } from 'mobx-react';
import { UserStore } from '../../../stores';

export interface ProfileSectionProps {
  changeCurrentUser: () => void,
  userStore: UserStore
}

export interface ProfileSectionState {
  showModal: boolean;
  username: string;
  password: string;
  confirmPassword: string;
  errorAuthenticating: boolean
}

@observer
export class ProfileSection extends React.Component<ProfileSectionProps, ProfileSectionState> {

  constructor(props?: ProfileSectionProps, context?: any) {
    super(props, context);
    this.state = {
      showModal: false, username: "", password: "", confirmPassword: "", errorAuthenticating: false
    };
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.attemptSignIn = this.attemptSignIn.bind(this);
    this.attemptSignOut = this.attemptSignOut.bind(this);
    this.renderForGuest = this.renderForGuest.bind(this);
    this.renderForUser = this.renderForUser.bind(this);
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
    // console.log("Hey! " + this.state.showModal.toString());
  }

  handleChange(e: any) {
    // log("Need to change: " + e.currentTarget.id + " to: " + e.currentTarget.value);
    this.setState({ [e.currentTarget.id]: e.currentTarget.value });
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
      this.close();
      this.setState({ errorAuthenticating: false });
    } catch (err) {
      error("Error while trying to authenticate: " + err);
      this.setState({ errorAuthenticating: true });
    }
  }

  async attemptSignOut() {
    try {
      const url = REST_DOMAIN + '/logout';
      const logOutResponse = await fetch(url, {
        credentials: "include",
        method: "get",
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
      });

      // const userData: UserModel = await logOutResponse.json();
      const text: string = await logOutResponse.text();
      log("Log Out Attempt Returned: ");
      log(text);
      // log("Authentication Attempt Returned: " + text);
      this.props.changeCurrentUser();
    } catch (err) {
      error("Error while trying to log out: " + err);
    }
  }

  renderSignInModal() {
    const { errorAuthenticating } = this.state;
    const validationState = errorAuthenticating === true ? "error" : null;

    return (
      <div className="static-modal" >
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header>
            <Modal.Title>Sign In to newsfeeds.fyi</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <FormGroup controlId="username" validationState={validationState}>
                <ControlLabel>Username: </ControlLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="Username" />
              </FormGroup>
              <FormGroup controlId="password" validationState={validationState}>
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

  renderForGuest() {
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

  renderForUser() {
    const { userStore } = this.props;
    const { currentUser } = userStore;
    const profileText: string = "Signed In As " + currentUser.username;
    const popoverBottom: JSX.Element = (
      <Popover id="popover-positioned-bottom" title="Account Options">
        <Button className={styles.popoverButton}>Edit Account</Button>
        <Button className={styles.popoverButton} onClick={this.attemptSignOut}>Log Out</Button>
      </Popover>
    );

    return (
      <OverlayTrigger trigger="click" placement="bottom" overlay={popoverBottom}>
        <div className={styles.profileSection}>
          {this.renderSignInModal()}
          <i className="fa fa-user fa-2x" aria-hidden="true"></i>
          <p>
            {profileText}
          </p>
        </div>
      </OverlayTrigger>
    );
  }

  render() {
    const { userStore } = this.props;
    const { currentUser } = userStore;
    const isGuest: boolean = currentUser.roleID === Roles.GUEST;
    const renderMethod: Function = isGuest ? this.renderForGuest : this.renderForUser;

    return (
      <div className={styles.popover}>
        {renderMethod()}
      </div>
    );
  }
}

export default ProfileSection;
