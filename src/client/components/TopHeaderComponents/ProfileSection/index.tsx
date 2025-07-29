import * as React from 'react';
import styles from './styles.css';
import { Modal, Button, FormGroup, FormLabel, FormControl, OverlayTrigger, Popover } from "react-bootstrap";
import { REST_DOMAIN } from 'client/constants/network';
import { UserModel } from 'common/models';
import { Roles, ROLE_DB_NAMES } from 'common/constants';
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
  showModal: boolean;
  username: string;
  password: string;
  confirmPassword: string;
  errorAuthenticating: boolean
}

@observer
export class ProfileSection extends React.Component<ProfileSectionProps, ProfileSectionState> {

  constructor(props: ProfileSectionProps) {
    super(props);
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
    log("Need to change: " + e.currentTarget.id + " to: " + e.currentTarget.value);
    const id = e.currentTarget.id as keyof ProfileSectionState;
    this.setState({ [id]: e.currentTarget.value } as Pick<ProfileSectionState, keyof ProfileSectionState>);
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
        // headers: {
          // "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        // },
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
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");      
      const logOutResponse = await fetch(url, {
        credentials: "include",
        method: "get",
        headers: headers
/*         headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        } */
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
      <Modal 
        show={this.state.showModal} 
        onHide={this.close}
        backdrop={true}
        keyboard={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Sign In to newsfeeds.fyi</Modal.Title>
        </Modal.Header>

          <Modal.Body>
            <form onSubmit={(e) => { e.preventDefault(); this.attemptSignIn(); }}>
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
              <FormGroup controlId="confirmPassword">
                <FormLabel>Confirm Password: </FormLabel>
                <FormControl
                  onChange={this.handleChange}
                  type="password"
                  placeholder="Confirm Password"
                />
              </FormGroup>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" onClick={this.close}>Cancel</Button>
            <Button type="button" variant="primary" onClick={this.attemptSignIn}>Sign In</Button>
          </Modal.Footer>

        </Modal>
    )
  }

  renderForGuest() {
    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#e8f5e8', padding: '8px' } : {};
    
    return (
      <div className={styles.profileSection} onClick={this.open} style={debugStyle}>
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
        {this.renderSignInModal()}
      </div>
    );
  }
}

export default ProfileSection;
