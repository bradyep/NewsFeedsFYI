import * as React from "react";
import { UserFeedModel } from "common/models";
import { Roles, MAX_NEWS_ITEMS } from "common/constants";
import { UserStore, PageStore } from "client/stores";
import { FormGroup, Button, Modal, FormLabel, FormControl, DropdownButton, Dropdown } from "react-bootstrap";
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

class AddNewsFeedSection extends React.Component<AddNewsFeedSectionProps, AddNewsFeedSectionState> {

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
    this.attemptToUpdateFeed = this.attemptToUpdateFeed.bind(this);
    this.attemptToDeleteFeed = this.attemptToDeleteFeed.bind(this);
  }

  closeModal() {
    this.props.pageStore.setUserFeedBeingEdited(undefined);
  }

  openModalToAddUserFeed() {
    const initalPageID = this.props.pageStore.currentlyDisplayedPage.pageID || 1;
    this.props.pageStore.setUserFeedBeingEdited({
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

  async attemptToUpdateFeed(): Promise<void> {
    const { pageStore } = this.props;
    const { userFeedBeingEdited } = pageStore;
    let userFeedModel: UserFeedModel;

    try {
      const userFeedID: number = userFeedBeingEdited?.userFeedID ?? (() => { throw new Error("userFeedID cannot be null or undefined."); })();
      const requestBody = "name=" + userFeedBeingEdited?.name + "&itemDisplayCount=" + userFeedBeingEdited?.itemDisplayCount + "&pageID=" + userFeedBeingEdited?.pageID + "&feedSourceID=" + userFeedBeingEdited?.feedSourceID + "&column=" + userFeedBeingEdited?.column + "&row=" + userFeedBeingEdited?.row;
      log('Attempting to Update UserFeed: ' + requestBody);
      const url = REST_DOMAIN + `/userfeeds/${userFeedID}`;
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      const addFeedResponse = await fetch(url, {
        credentials: "include",
        method: "put",
        headers: headers,
        body: requestBody
      });

      userFeedModel = await addFeedResponse.json();
      log("Update UserFeed Attempt Returned: " + JSON.stringify(userFeedModel));

      // Parse the response and convert string values to numbers
      const updatedFeed: Partial<UserFeedModel> = {
        userFeedID: userFeedModel.userFeedID,
        pageID: typeof userFeedModel.pageID === 'string' ? parseInt(userFeedModel.pageID) : userFeedModel.pageID,
        column: typeof userFeedModel.column === 'string' ? parseInt(userFeedModel.column) : userFeedModel.column,
        row: typeof userFeedModel.row === 'string' ? parseInt(userFeedModel.row) : userFeedModel.row,
        name: userFeedModel.name,
        itemDisplayCount: typeof userFeedModel.itemDisplayCount === 'string' ? parseInt(userFeedModel.itemDisplayCount) : userFeedModel.itemDisplayCount,
        feedSourceID: userFeedModel.feedSourceID
      };

      // Use the parsed UserFeed data to update PageStore
      pageStore.editUserFeed(userFeedID, updatedFeed);

      this.closeModal();
    } catch (err) {
      error("Error while trying update feed: " + err.toString());
      this.setState({ errorCreatingNewFeed: true });
      throw new Error('--Error while trying update feed--');
    }

    this.setState({ errorCreatingNewFeed: false });

    return;
  }

  async attemptToDeleteFeed(): Promise<void> {
    const { pageStore } = this.props;
    const { userFeedBeingEdited } = pageStore;
    let returnedUserFeedModel: UserFeedModel;

    if (!userFeedBeingEdited) {
      error("No feed is currently being edited.");
      return;
    }

    try {
      const userFeedID: number = userFeedBeingEdited?.userFeedID ?? (() => { throw new Error("userFeedID cannot be null or undefined."); })();
      const url = REST_DOMAIN + `/userfeeds/${userFeedID}`;
      const deleteFeedResponse = await fetch(url, {
        credentials: "include",
        method: "delete"
      });

      if (!deleteFeedResponse.ok) {
        throw new Error("Failed to delete feed.");
      }

      returnedUserFeedModel = await deleteFeedResponse.json();
      log("Delete UserFeed Attempt Returned: " + JSON.stringify(returnedUserFeedModel));
      pageStore.deleteUserFeed(userFeedID);
      this.closeModal();
    } catch (err) {
      error("Error while trying delete feed: " + err.toString());
      this.setState({ errorCreatingNewFeed: true });
      throw new Error('--Error while trying delete feed--');
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
            <Modal.Title>{pageStore.userFeedBeingEdited?.isEditing ? 'Edit News Feed' : 'Add News Feed'}</Modal.Title>
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
                <FormControl onChange={this.handleChange} type="text" placeholder="NYTimes US News" value={pageStore.userFeedBeingEdited?.name || ""} />
              </FormGroup>
              {!pageStore.userFeedBeingEdited?.isEditing && (
                <FormGroup controlId="feedSourceUrl">
                  <FormLabel>Feed RSS URL: </FormLabel>
                  <FormControl onChange={this.handleChange} type="text" placeholder="http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" />
                </FormGroup>
              )}
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
            {!pageStore.userFeedBeingEdited?.isEditing && (
              <Button variant="primary" onClick={this.attemptToAddFeed}>Create Feed</Button>
            )}
            {pageStore.userFeedBeingEdited?.isEditing && (
              <>
                <Button variant="danger" onClick={this.attemptToDeleteFeed}>Delete Feed</Button>
                <Button variant="primary" onClick={this.attemptToUpdateFeed}>Save Feed</Button>
              </>
            )}
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

const ObservedAddNewsFeedSection = observer(AddNewsFeedSection);
export { ObservedAddNewsFeedSection as AddNewsFeedSection };
export default ObservedAddNewsFeedSection;
