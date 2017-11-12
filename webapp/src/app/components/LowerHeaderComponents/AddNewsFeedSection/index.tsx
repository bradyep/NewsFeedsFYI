import * as React from "react";
import { Roles, ROLE_DB_NAMES } from "../../../../../../nffyi-common/constants/roles";
import { UserStore } from "../../../stores";
import { FormGroup, InputGroup, Button, Modal, ControlLabel, FormControl, DropdownButton, MenuItem } from "react-bootstrap";
import { observer } from 'mobx-react';
import { MAX_NEWS_ITEMS } from '../../../../../../nffyi-common/constants/newsfeeds';
import * as logModule from 'debug';
const log = logModule('webapp:AddNewsFeedSection');

export interface AddNewsFeedSectionProps {
  userStore: UserStore
}

export interface AddNewsFeedSectionState {
  selectedPage: number,
  feedName: string,
  feedURL: string,
  itemsToDisplay: number,
  addFeedError: boolean,
  showModal: boolean;
}

@observer
export class AddNewsFeedSection extends React.Component<AddNewsFeedSectionProps, AddNewsFeedSectionState> {

  constructor(props?: AddNewsFeedSectionProps, context?: any) {
    super(props, context);
    this.state = {
      showModal: false, selectedPage: -1, feedName: "", feedURL: "", itemsToDisplay: 3, addFeedError: false
    };
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleItemCountChange = this.handleItemCountChange.bind(this);
    this.attemptToAddFeed = this.attemptToAddFeed.bind(this);
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  openModal() {
    this.setState({ showModal: true });
    // console.log("Hey! " + this.state.showModal.toString());
  }

  handleChange(e: any) {
    log("Need to change: " + e.currentTarget.id + " to: " + e.currentTarget.value);
    this.setState({ [e.currentTarget.id]: e.currentTarget.value });
  }

  handleItemCountChange(itemCount: any): any {
    log('event: ' + itemCount);
    this.setState({ itemsToDisplay: +itemCount });    
  }

  async attemptToAddFeed() {

  }

  renderAddNewsFeedModal() {
    const { addFeedError } = this.state;
    // const validationState = errorAuthenticating === true ? "error" : null;
    const validationState = false;
    let numberOfItemsOptions = [];
    for (let i = 1; i <= MAX_NEWS_ITEMS; i++) {
      numberOfItemsOptions.push(<MenuItem key={i} eventKey={i}>{i}</MenuItem>)
    }

    return (
      <div className="static-modal" >
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>Add News Feed</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <FormGroup controlId="page">
                <ControlLabel>Add to Page: </ControlLabel>
                <DropdownButton title="General News" id="1">
                  <MenuItem eventKey="1" active>General News</MenuItem>
                  <MenuItem eventKey="2">Development</MenuItem>
                  <MenuItem eventKey="3">Design</MenuItem>
                </DropdownButton>
              </FormGroup>
              <FormGroup controlId="feedName">
                <ControlLabel>Feed Name: </ControlLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="NYTimes US News" />
              </FormGroup>
              <FormGroup controlId="feedURL">
                <ControlLabel>Feed RSS URL: </ControlLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" />
              </FormGroup>
              <FormGroup controlId="numberOfItemsToDisplay">
                <ControlLabel>Number of Items to Display: </ControlLabel>
                <DropdownButton title={this.state.itemsToDisplay.toString()} id="itemsToDisplay" onSelect={this.handleItemCountChange}>
                  {numberOfItemsOptions}
                </DropdownButton>
              </FormGroup>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.closeModal}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.attemptToAddFeed}>Sign In</Button>
          </Modal.Footer>

        </Modal>
      </div>
    )
  }

  render() {
    const { userStore } = this.props;
    const { currentUser } = userStore;
    const disabled = currentUser.roleID === Roles.GUEST;

    return (
      <div className="col-md-2">
        {this.renderAddNewsFeedModal()}
        <Button bsStyle="primary" disabled={disabled} onClick={this.openModal}>Add News Feed</Button>
      </div>
    );
  }
}

export default AddNewsFeedSection;
