import * as React from "react";
import { UserFeedModel, PageModel } from "common/models";
import { Roles, ROLE_DB_NAMES, MAX_NEWS_ITEMS } from "common/constants";
import { UserStore, PageStore } from "client/stores";
import { FormGroup, InputGroup, Button, Modal, FormLabel, FormControl, DropdownButton, Dropdown } from "react-bootstrap";
import { observer } from 'mobx-react';
import { REST_DOMAIN } from 'client/constants/network';
import debug from 'debug';
const log = debug('webapp:AddNewsFeedSection');
const error = debug('webapp:error');

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

  constructor(props: AddNewsFeedSectionProps) {
    super(props);
    // const initialSelectedPageID = props.pageStore.pages[0].pageID;
    // Starting with a bad selectedPageID. This should be changed when the user opens a modal
    this.state = {
      showModal: false, selectedPageID: -1, feedName: "", feedURL: "", itemsToDisplay: 3, addFeedError: false, errorCreatingNewFeed: false
    };
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleItemCountChange = this.handleItemCountChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.attemptToAddFeed = this.attemptToAddFeed.bind(this);
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  openModal() {
    // Set selectedPageID here
    const { pageStore } = this.props;
    const initalPageID = pageStore.pages[0].pageID ?? 0;
    this.setState({ showModal: true, selectedPageID: initalPageID });
    // console.log("Hey! " + this.state.showModal.toString());
  }

  handleChange(e: any) {
    log("Need to change: " + e.currentTarget.id + " to: " + e.currentTarget.value);
    // this.setState({ [e.currentTarget.id]: e.currentTarget.value });
    const id = e.currentTarget.id as keyof AddNewsFeedSectionState;
    this.setState({ [id]: e.currentTarget.value } as Pick<AddNewsFeedSectionState, keyof AddNewsFeedSectionState>);
  }

  handleItemCountChange(itemCount: any): any {
    log('event: ' + itemCount);
    this.setState({ itemsToDisplay: +itemCount });
  }

  handlePageChange(pageID: any): any {
    log('event: ' + pageID);
    this.setState({ selectedPageID: +pageID });
  }

  async attemptToAddFeed(): Promise<void> {
    const { pageStore } = this.props;
    let userFeedModel: UserFeedModel;
    const pageIDToUse: number = this.state.selectedPageID;

    try {
      log('Attempting to Create New UserFeed: name=' + this.state.feedName + "&itemDisplayCount=" + this.state.itemsToDisplay + "&pageID=" + pageIDToUse + "&feedURL=" + this.state.feedURL);
      const url = REST_DOMAIN + '/userfeeds';
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      const addFeedResponse = await fetch(url, {
        credentials: "include",
        method: "post",
        headers: headers,
        body: "name=" + this.state.feedName + "&itemDisplayCount=" + this.state.itemsToDisplay + "&pageID=" + pageIDToUse + "&feedURL=" + this.state.feedURL
      });

      userFeedModel = await addFeedResponse.json();
      // const text: string = await authenticationResponse.text();
      log("Create New UserFeed Attempt Returned: ");
      log(userFeedModel);
      this.closeModal();
      // this.setState({ errorCreatingNewFeed: false });
      log('Done Creating new UserFeed');
    } catch (err) {
      error("Error while trying add feed: " + err.toString());
      this.setState({ errorCreatingNewFeed: true });
      throw new Error('--Error while trying add feed--');
    }
    // Add the returned UserFeed to the proper Page in the PageStore
    try {
      // const page: PageModel | undefined = pageStore.pages.find(p => p.pageID === pageIDToUse);
      // if (!page) throw new Error('Could not find page in pageStore to add new UserFeed to');
      pageStore.addUserFeed(pageIDToUse, userFeedModel);
      // page.test();
      // page.addUserFeed(userFeedModel);
    } catch (err) {
      error("[webpack error we may be able to ignore] Error while trying add feed to pageStore: " + err.toString());
      // this.setState({ errorCreatingNewFeed: true });
      // throw new Error('--Error while trying add feed to pageStore--');
    }

    this.setState({ errorCreatingNewFeed: false });

    return;
  }

  renderAddNewsFeedModal() {
    const { addFeedError } = this.state;
    // const validationState = errorAuthenticating === true ? "error" : null;
    const validationState = false;
    let numberOfItemsOptions = [];
    for (let i = 1; i <= MAX_NEWS_ITEMS; i++) {
      numberOfItemsOptions.push(<Dropdown.Item key={i} eventKey={i}>{i}</Dropdown.Item>)
    }
    const { pageStore } = this.props;
    const { pages } = pageStore;
    const selectedPage = pages.find(p => p.pageID == +this.state.selectedPageID) || pages[0];
    const selectedPageTitle = selectedPage.name;

    return (
      <div className="static-modal" >
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>Add News Feed</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <FormGroup controlId="page">
                <FormLabel>Add to Page: </FormLabel>
                <DropdownButton title={selectedPageTitle} id={this.state.selectedPageID.toString()} onSelect={this.handlePageChange}>
                  {pages.map((page, i) =>
                    <Dropdown.Item key={i} eventKey={page.pageID}>{page.name}</Dropdown.Item>
                  )}
                </DropdownButton>
              </FormGroup>
              <FormGroup controlId="feedName">
                <FormLabel>Feed Name: </FormLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="NYTimes US News" />
              </FormGroup>
              <FormGroup controlId="feedURL">
                <FormLabel>Feed RSS URL: </FormLabel>
                <FormControl onChange={this.handleChange} type="text" placeholder="http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" />
              </FormGroup>
              <FormGroup controlId="numberOfItemsToDisplay">
                <FormLabel>Number of Items to Display: </FormLabel>
                <DropdownButton title={this.state.itemsToDisplay.toString()} id="itemsToDisplay" onSelect={this.handleItemCountChange}>
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
        <Button variant="primary" size="sm" disabled={disabled} onClick={this.openModal}>Add News Feed</Button>
      </div>
    );
  }
}

export default AddNewsFeedSection;
