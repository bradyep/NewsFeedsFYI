import * as React from 'react';
import styles from './styles.css';
import { Modal, Button, FormGroup, FormLabel, FormControl, OverlayTrigger, Popover } from "react-bootstrap";
import { LOGIN_URL, LOGOUT_URL, REGISTER_URL } from 'client/constants/network';
import { login, register, logout } from 'client/services/api';
import { MIN_PASSWORD_LENGTH } from 'common/constants';
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
  email: string
  errorAuthenticating: boolean
  errorMessage: string
  isSignIn: boolean
  isSignUp: boolean
}

class ProfileSection extends React.Component<ProfileSectionProps, ProfileSectionState> {

  constructor(props: ProfileSectionProps) {
    super(props);
    this.state = {
      showModal: false, username: "", password: "", confirmPassword: "", email: "",
      errorAuthenticating: false, errorMessage: "", isSignIn: false, isSignUp: false
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

  validateSignUp(): string | undefined {
    const { username, password, confirmPassword, email } = this.state;
    if (!username.trim()) return 'Username is required.';
    if (!email.trim()) return 'Email is required.';
    if (!password) return 'Password is required.';
    if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (password !== confirmPassword) return 'Passwords do not match.';
    return undefined;
  }

  async attemptSignUp() {
    const validationError = this.validateSignUp();
    if (validationError) {
      this.setState({ errorAuthenticating: true, errorMessage: validationError });
      return;
    }
    try {
      const result = await register(REGISTER_URL, this.state.username, this.state.password, this.state.email);
      if (!result.ok) {
        this.setState({ errorAuthenticating: true, errorMessage: result.message ?? 'Sign up failed.' });
        return;
      }
      log("Sign up Attempt Returned: ", result.user);
      // Now try to sign them in
      await this.attemptSignIn();
    } catch (err) {
      error("Error while trying to sign up: " + err);
      this.setState({ errorAuthenticating: true, errorMessage: 'Sign up failed.' });
    }
  }

  async attemptSignIn() {
    if (!this.state.username || !this.state.password) {
      this.setState({ errorAuthenticating: true, errorMessage: 'Username and password are required.' });
      return;
    }
    try {
      const result = await login(LOGIN_URL, this.state.username, this.state.password);
      if (!result.ok) {
        this.setState({ errorAuthenticating: true, errorMessage: result.message ?? 'Sign in failed.' });
        return;
      }
      log("Authentication Attempt Returned: ", result.user);
      this.setState({ errorAuthenticating: false, errorMessage: '' });
      this.props.changeCurrentUser();
      this.close();
    } catch (err) {
      error("Error while trying to authenticate: " + err);
      this.setState({ errorAuthenticating: true, errorMessage: 'Sign in failed.' });
    }
  }

  async attemptSignOut() {
    try {
      await logout(LOGOUT_URL);
      this.props.changeCurrentUser();
    } catch (err) {
      error("Error while trying to log out: " + err);
    }
  }

  renderSignInModal() {
    const { errorAuthenticating, errorMessage } = this.state;

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
          {errorAuthenticating && errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
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
            {this.state.isSignUp && (
              <FormGroup controlId="email">
                <FormLabel>Email: </FormLabel>
                <FormControl
                  onChange={this.handleChange}
                  type="email"
                  placeholder="Email"
                  isInvalid={errorAuthenticating === true}
                />
              </FormGroup>
            )}
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
                  isInvalid={errorAuthenticating === true}
                />
              </FormGroup>
            )}
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={this.close}>Cancel</Button>
          <Button type="button" variant="primary" data-testid="submit-auth" onClick={this.state.isSignIn ? this.attemptSignIn : this.attemptSignUp}>{this.state.isSignIn ? "Sign In" : "Sign Up"}</Button>
        </Modal.Footer>

      </Modal>
    )
  }

  renderForGuest() {
    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#e8f5e8', padding: '8px' } : {};

    return (
      <div className={styles.profileSection} style={debugStyle}>
        <Button variant="outline-primary" onClick={this.openModalForSignIn} data-testid="open-signin">
          <i aria-hidden="true"></i>
          <p className={styles['sign-in-text']}>
            Sign In
          </p>
        </Button>
        <Button variant="outline-primary" className={styles['sign-up-button']} onClick={this.openModalForSignUp} data-testid="open-signup">
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
    const isGuest: boolean = !userStore.isLoggedIn;
    const renderMethod: Function = isGuest ? this.renderForGuest : this.renderForUser;

    return (
      <div className={styles.popover}>
        {renderMethod()}
        {this.renderSignInModal()}
      </div>
    );
  }
}

const ObservedProfileSection = observer(ProfileSection);
export { ObservedProfileSection as ProfileSection };
export default ObservedProfileSection;
