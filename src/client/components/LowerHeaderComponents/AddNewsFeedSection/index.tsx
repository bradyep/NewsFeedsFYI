import * as React from "react";
import { UserFeedModel, PageModel } from "common/models";
import { Roles, ROLE_DB_NAMES, MAX_NEWS_ITEMS } from "common/constants";
import { UserStore, PageStore } from "client/stores";
import { FormGroup, InputGroup, Button, Modal, FormLabel, FormControl, DropdownButton, Dropdown } from "react-bootstrap";
import { observer } from 'mobx-react';
import { REST_DOMAIN } from 'client/constants/network';
import debug from 'debug';
import { EditableUserFeedModel } from "common/models/UserFeedModel";
const log = debug('webapp:AddNewsFeedSection');
const error = debug('webapp:error');

const INITIAL_ITEMS_TO_DISPLAY = 3;

export interface AddNewsFeedSectionProps {
  userStore: UserStore,
  pageStore: PageStore
}

export interface AddNewsFeedSectionState {
  addFeedError: boolean,
  errorCreatingNewFeed: boolean
}

@observer
export class AddNewsFeedSection extends React.Component<AddNewsFeedSectionProps, AddNewsFeedSectionState> {

  constructor(props: AddNewsFeedSectionProps) {
    super(props);
    this.state = {
      addFeedError: false, errorCreatingNewFeed: false
    };
    this.closeModal = this.closeModal.bind(this);
    this.openModalToAddUserFeed = this.openModalToAddUserFeed.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleItemCountChange = this.handleItemCountChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.attemptToAddFeed = this.attemptToAddFeed.bind(this);
  }

  closeModal() {
    const { pageStore } = this.props;
    pageStore.setUserFeedBeingEdited(undefined);
  }

  openModalToAddUserFeed() {
    const { pageStore } = this.props;
    const initalPageID = pageStore.currentlyDisplayedPage.pageID || 1;
    pageStore.setUserFeedBeingEdited({
      pageID: initalPageID,
      name: "",
      itemDisplayCount: INITIAL_ITEMS_TO_DISPLAY,
      feedSourceUrl: "",
      isEditing: false
    });
  }

  handleChange(e: any) {
    log("Need to change: " + e.currentTarget.id + " to: " + e.currentTarget.value);
    const id = e.currentTarget.id as keyof EditableUserFeedModel;
    // this.setState({ [id]: e.currentTarget.value } as Pick<AddNewsFeedSectionState, keyof AddNewsFeedSectionState>);
    this.props.pageStore.updateUserFeedBeingEdited({
      [id]: e.currentTarget.value
    });
  }

  handleItemCountChange(itemCount: any): any {
    log('event: ' + itemCount);
    this.props.pageStore.updateUserFeedBeingEdited({
      itemDisplayCount: +itemCount
    });
  }

  handlePageChange(pageID: any): any {
    log('handlePageChange event: ' + pageID);
    this.props.pageStore.updateUserFeedBeingEdited({
      pageID: +pageID
    });
  }

  async attemptToAddFeed(): Promise<void> {
    const { pageStore } = this.props;
    let userFeedModel: UserFeedModel;
    const pageIDToUse: number = pageStore.userFeedBeingEdited?.pageID || 1;

    try {
      log('Attempting to Create New UserFeed: name=' + pageStore.userFeedBeingEdited?.name + "&itemDisplayCount=" + pageStore.userFeedBeingEdited?.itemDisplayCount + "&pageID=" + pageIDToUse + "&feedURL=" + pageStore.userFeedBeingEdited?.feedSourceUrl);
      const url = REST_DOMAIN + '/userfeeds';
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      const addFeedResponse = await fetch(url, {
        credentials: "include",
        method: "post",
        headers: headers,
        body: "name=" + pageStore.userFeedBeingEdited?.name + "&itemDisplayCount=" + pageStore.userFeedBeingEdited?.itemDisplayCount + "&pageID=" + pageIDToUse + "&feedURL=" + pageStore.userFeedBeingEdited?.feedSourceUrl
      });

      userFeedModel = await addFeedResponse.json();
      log("Create New UserFeed Attempt Returned: ");
      log(userFeedModel);
      this.closeModal();
      log('Done Creating new UserFeed');
    } catch (err) {
      error("Error while trying add feed: " + err.toString());
      this.setState({ errorCreatingNewFeed: true });
      throw new Error('--Error while trying add feed--');
    }
    // Add the returned UserFeed to the proper Page in the PageStore
    try {
      pageStore.addUserFeed(pageIDToUse, userFeedModel);
    } catch (err) {
      error("[webpack error we may be able to ignore] Error while trying add feed to pageStore: " + err.toString());
    }

    this.setState({ errorCreatingNewFeed: false });

    return;
  }

  renderAddNewsFeedModal() {
    const { addFeedError } = this.state;
    const validationState = false;
    let numberOfItemsOptions = [];
    for (let i = 1; i <= MAX_NEWS_ITEMS; i++) {
      numberOfItemsOptions.push(<Dropdown.Item key={i} eventKey={i}>{i}</Dropdown.Item>)
    }
    const { pageStore } = this.props;
    const { pages } = pageStore;
    const selectedPage = pages.find(p => p.pageID == pageStore.userFeedBeingEdited?.pageID) || pages[0];
    const selectedPageTitle = selectedPage.name;

    return (
      <div className="static-modal" >
        <Modal show={pageStore.userFeedBeingEdited !== undefined} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add News Feed</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <FormGroup controlId="pageID">
                <FormLabel>Display on page: </FormLabel>
                <DropdownButton title={selectedPageTitle} id={pageStore.userFeedBeingEdited?.pageID?.toString() || "0"} onSelect={this.handlePageChange}>
                  {pages.map((page, i) =>
                    <Dropdown.Item key={i} eventKey={page.pageID}>{page.name}</Dropdown.Item>
                  )}
                </DropdownButton>
              </FormGroup>
              <FormGroup controlId="name">
                <FormLabel>Feed Name: </FormLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="NYTimes US News" />
              </FormGroup>
              <FormGroup controlId="feedSourceUrl">
                <FormLabel>Feed RSS URL: </FormLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" />
              </FormGroup>
              <FormGroup controlId="itemDisplayCount">
                <FormLabel>Number of Items to Display: </FormLabel>
                <DropdownButton title={pageStore.userFeedBeingEdited?.itemDisplayCount.toString() || "unknown"} id="itemsToDisplay" onSelect={this.handleItemCountChange}>
                  {numberOfItemsOptions}
                </DropdownButton>
              </FormGroup>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.closeModal}>Cancel</Button>
            <Button variant="primary" onClick={this.attemptToAddFeed}>Create Feed</Button>
          </Modal.Footer>

        </Modal>
      </div>
    )
  }

  render() {
    const { userStore } = this.props;
    const { currentUser } = userStore;
    const disabled = currentUser.roleID === Roles.GUEST;

    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#fff3e0', padding: '8px' } : {};

    return (
      <div className="col-md-3 mb-2" style={debugStyle}>
        {this.renderAddNewsFeedModal()}
        <Button variant="primary" size="sm" disabled={disabled} onClick={() => this.openModalToAddUserFeed()}>Add News Feed</Button>
      </div>
    );
  }
}

export default AddNewsFeedSection;
