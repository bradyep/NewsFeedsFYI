import * as React from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { UserStore, PageStore } from "../../../stores";
import { Roles } from "common/constants";
import { PageModel } from 'common/models';
import { REST_DOMAIN } from 'client/constants/network';
import { getUserPageFeeds } from 'client/services/api';
import styles from './styles.css';
import debug from 'debug';
const log = debug('webapp:PageSection');

export interface PageSectionProps {
  userStore: UserStore,
  pageStore: PageStore
}

export interface PageSectionState { }

@observer
export class PageSection extends React.Component<PageSectionProps, PageSectionState> {
  constructor(props: PageSectionProps) {
    super(props);
    this.handleSelectPage = this.handleSelectPage.bind(this);
  }

  handleSelectPage = async (eventKey: string | null) => {
    log('Selecting page with eventKey:', eventKey);
    const { pageStore } = this.props;
    if (eventKey) {
      const selectedPage: PageModel | undefined = pageStore.pages.find(page => page.pageID === +eventKey);
      if (selectedPage && selectedPage.pageID) {
        // Check if the selected page has user feeds
        if (!selectedPage.userFeeds) {
          selectedPage.userFeeds = await getUserPageFeeds(REST_DOMAIN + '/userfeeds/page/', selectedPage.pageID);
          log(`We have selectedPage and ID but no userFeeds, so we got ${selectedPage.userFeeds.length} feeds`);
        }
        pageStore.setCurrentlyDisplayedPage(+eventKey);
      }
    }
  }

  render() {
    const { userStore, pageStore } = this.props;
    const { currentUser } = userStore;
    const { pages } = pageStore;

    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#fff9c4', padding: '8px' } : {};

    return (
      <div className="col-md-3 mb-2" style={debugStyle}>
        <div className="d-flex align-items-center">
          <span className="me-2">Page:</span>
          <DropdownButton title={pageStore.currentlyDisplayedPage.name} id={pages[0].pageID?.toString()} size="sm" onSelect={this.handleSelectPage}>
            {pages.map((page) => 
              <Dropdown.Item key={page.pageID} eventKey={page.pageID} active={page.pageID === pageStore.currentlyDisplayedPage.pageID}>{page.name}</Dropdown.Item>  
            )}
          </DropdownButton>
          {currentUser.roleID != Roles.GUEST &&
            <i className={`fa fa-cog ${styles.biggerCog} ms-2`} aria-hidden="true"></i>
          }
        </div>
      </div>
    );
  }
}

export default PageSection;
