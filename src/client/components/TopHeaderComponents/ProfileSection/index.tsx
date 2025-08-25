import * as React from 'react';
import styles from './styles.css';
import { Modal, Button, FormGroup, FormLabel, FormControl, OverlayTrigger, Popover } from "react-bootstrap";
import { REST_DOMAIN } from 'client/constants/network';
import { UserModel } from 'common/models';
import { Roles } from 'common/constants';
import debug from 'debug';
const log = debug('webapp:ProfileSection');
const error = debug('webapp:error');
import { observer } from 'mobx-react';
import { UserStore } from 'client/stores';

export interface ProfileSectionProps {
  changeCurrentUser: () => void,
  userStore: UserStore
}

export interface ProfileSectionState {
  showModal: boolean
  username: string
  password: string
  confirmPassword: string
  errorAuthenticating: boolean
  isSignIn: boolean
  isSignUp: boolean
}

@observer
export class ProfileSection extends React.Component<ProfileSectionProps, ProfileSectionState> {

  constructor(props: ProfileSectionProps) {
    super(props);
    this.state = {
      showModal: false, username: "", password: "", confirmPassword: "", errorAuthenticating: false, isSignIn: false, isSignUp: false
    };
    this.close = this.close.bind(this);
    this.openModalForSignUp = this.openModalForSignUp.bind(this);
    this.openModalForSignIn = this.openModalForSignIn.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.attemptSignIn = this.attemptSignIn.bind(this);
    this.attemptSignUp = this.attemptSignUp.bind(this);
    this.attemptSignOut = this.attemptSignOut.bind(this);
    this.renderForGuest = this.renderForGuest.bind(this);
    this.renderForUser = this.renderForUser.bind(this);
  }

  close() {
    this.setState({ showModal: false });
  }

  openModalForSignUp() {
    this.setState({ showModal: true, isSignUp: true, isSignIn: false });
  }

  openModalForSignIn() {
    this.setState({ showModal: true, isSignIn: true, isSignUp: false });
  }

  handleChange(e: any) {
    log("Need to change: " + e.currentTarget.id + " to: " + e.currentTarget.value);
    const id = e.currentTarget.id as keyof ProfileSectionState;
    this.setState({ [id]: e.currentTarget.value } as Pick<ProfileSectionState, keyof ProfileSectionState>);
  }

  async attemptSignUp() {
    try {
      const url = REST_DOMAIN + '/users';
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      const signUpResponse = await fetch(url, {
        credentials: "include",
        method: "post",
        headers: headers,
        // TODO: Add email
        body: "username=" + this.state.username + "&password=" + this.state.password + "&email=" + ""
      });

      // TODO: Input validation, required fields, confirm password check, race conditions, CSRF token, UI feedback during async operations, error state management
      const userData: UserModel = await signUpResponse.json();
      if (!signUpResponse.ok) {
        throw new Error(`Signup failed: ${signUpResponse.status}`);
      }
      log("Sign up Attempt Returned: ");
      log(userData);
      // Now try to sign them in
      this.setState({ username: this.state.username, password: this.state.password });
      this.attemptSignIn();
      this.setState({ errorAuthenticating: false });
    } catch (err) {
      error("Error while trying to sign up: " + err);
      this.setState({ errorAuthenticating: true });
    }
  }

  async attemptSignIn() {
    try {
      const url = REST_DOMAIN + '/authenticate';
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      const authenticationResponse = await fetch(url, {
        credentials: "include",
        method: "post",
        headers: headers,
        body: "username=" + this.state.username + "&password=" + this.state.password
      });

      const userData: UserModel = await authenticationResponse.json();
      log("Authentication Attempt Returned: ", userData);
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
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      const logOutResponse = await fetch(url, {
        credentials: "include",
        method: "get",
        headers: headers
      });

      const text: string = await logOutResponse.text();
      log("Log Out Attempt Returned: ");
      log(text);
      this.props.changeCurrentUser();
    } catch (err) {
      error("Error while trying to log out: " + err);
    }
  }

  renderSignInModal() {
    const { errorAuthenticating } = this.state;
    const validationState = errorAuthenticating === true ? "error" : null;

    return (
      <Modal
        show={this.state.showModal}
        onHide={this.close}
        backdrop={true}
        keyboard={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.state.isSignIn ? "Sign In to newsfeeds.fyi" : "Sign Up for newsfeeds.fyi"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={(e) => { e.preventDefault(); this.state.isSignIn ? this.attemptSignIn() : this.attemptSignUp(); }}>
            <FormGroup controlId="username">
              <FormLabel>Username: </FormLabel>
              <FormControl
                onChange={this.handleChange}
                type="text"
                placeholder="Username"
                isInvalid={errorAuthenticating === true}
              />
            </FormGroup>
            <FormGroup controlId="password">
              <FormLabel>Password: </FormLabel>
              <FormControl
                onChange={this.handleChange}
                type="password"
                placeholder="Password"
                isInvalid={errorAuthenticating === true}
              />
            </FormGroup>
            {this.state.isSignUp && (
              <FormGroup controlId="confirmPassword">
                <FormLabel>Confirm Password: </FormLabel>
                <FormControl
                  onChange={this.handleChange}
                  type="password"
                  placeholder="Confirm Password"
                />
              </FormGroup>
            )}
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={this.close}>Cancel</Button>
          <Button type="button" variant="primary" onClick={this.state.isSignIn ? this.attemptSignIn : this.attemptSignUp}>{this.state.isSignIn ? "Sign In" : "Sign Up"}</Button>
        </Modal.Footer>

      </Modal>
    )
  }

  renderForGuest() {
    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#e8f5e8', padding: '8px' } : {};

    return (
      <div className={styles.profileSection} style={debugStyle}>
        <Button variant="outline-primary" onClick={this.openModalForSignIn}>
          <i aria-hidden="true"></i>
          <p className={styles['sign-in-text']}>
            Sign In
          </p>
        </Button>
        <Button variant="outline-primary" className={styles['sign-up-button']} onClick={this.openModalForSignUp}>
          <i className="fa fa-user" aria-hidden="true"></i>
          <p className={styles['sign-in-text']}>
            Sign Up
          </p>
        </Button>
      </div>
    );
  }

  renderForUser() {
    const { userStore } = this.props;
    const { currentUser } = userStore;
    const profileText: string = "Signed In As " + currentUser.username;
    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#e8f5e8', padding: '8px' } : {};

    const popoverBottom: JSX.Element = (
      <Popover id="popover-positioned-bottom" title="Account Options">
        <Button className={styles.popoverButton}>Edit Account</Button>
        <Button className={styles.popoverButton} onClick={this.attemptSignOut}>Log Out</Button>
      </Popover>
    );

    return (
      <OverlayTrigger trigger="click" placement="bottom" overlay={popoverBottom}>
        <div className={styles.profileSection} style={debugStyle}>
          <Button variant="outline-primary">
            <i className="fa fa-user fa-2x" aria-hidden="true"></i>
            <p className={styles['sign-in-text']}>
              {profileText}
            </p>
          </Button>
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
        {this.renderSignInModal()}
      </div>
    );
  }
}

export default ProfileSection;
