import * as React from "react";
import { Roles, ROLE_DB_NAMES } from "../../../../../../nffyi-common/constants/roles";
import { UserStore, PageStore } from "../../../stores";
import { FormGroup, InputGroup, Button, Modal, ControlLabel, FormControl, DropdownButton, MenuItem } from "react-bootstrap";
import { observer } from 'mobx-react';
import { MAX_NEWS_ITEMS } from '../../../../../../nffyi-common/constants/newsfeeds';
import { REST_DOMAIN } from '../../../constants/network';
import * as logModule from 'debug';
const log = logModule('webapp:AddNewsFeedSection');
const error = logModule('webapp:error');
import { UserFeedModel } from '../../../../../../nffyi-common/models';

export interface AddNewsFeedSectionProps {
  userStore: UserStore,
  pageStore: PageStore
}

export interface AddNewsFeedSectionState {
  selectedPageID: number,
  feedName: string,
  feedURL: string,
  itemsToDisplay: number,
  addFeedError: boolean,
  showModal: boolean,
  errorCreatingNewFeed: boolean  
}

@observer
export class AddNewsFeedSection extends React.Component<AddNewsFeedSectionProps, AddNewsFeedSectionState> {

  constructor(props?: AddNewsFeedSectionProps, context?: any) {
    super(props, context);
    this.state = {
      showModal: false, selectedPageID: -1, feedName: "", feedURL: "", itemsToDisplay: 3, addFeedError: false, errorCreatingNewFeed: false
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
    try {
      const url = REST_DOMAIN + '/userfeeds';
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      const authenticationResponse = await fetch(url, {
        credentials: "include",
        method: "post",
        // headers: {
        //   "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        // },
        headers: headers,
        //   userFeedsModel.create(new UserFeedModel(req.body.name, req.body.itemDisplayCount, req.body.pageID))
        body: "name=" + this.state.feedName + "&itemDisplayCount=" + this.state.itemsToDisplay + "&pageID=" + this.state.selectedPageID
      });

      const userFeedModel: UserFeedModel = await authenticationResponse.json();
      // const text: string = await authenticationResponse.text();
      log("Create New UserFeed Attempt Returned: ");
      log(userFeedModel);
      // log("Authentication Attempt Returned: " + text);
      // Add the returned UserFeed to the proper Page in the PageStore
      
      // this.props.changeCurrentUser();
      this.closeModal();
      this.setState({ errorCreatingNewFeed: false });
    } catch (err) {
      error("Error while trying to authenticate: " + err);
      this.setState({ errorCreatingNewFeed: true });
    }
  }

  renderAddNewsFeedModal() {
    const { addFeedError } = this.state;
    // const validationState = errorAuthenticating === true ? "error" : null;
    const validationState = false;
    let numberOfItemsOptions = [];
    for (let i = 1; i <= MAX_NEWS_ITEMS; i++) {
      numberOfItemsOptions.push(<MenuItem key={i} eventKey={i}>{i}</MenuItem>)
    }
    const { pageStore } = this.props;
    const { pages } = pageStore;

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
                <DropdownButton title={pages[0].name} id={pages[0].pageID.toString()}>
                  {pages.map((page, i) => 
                    <MenuItem key={i} eventKey={page.pageID}>{page.name}</MenuItem>  
                  )}
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
            <Button bsStyle="primary" onClick={this.attemptToAddFeed}>Create Feed</Button>
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
