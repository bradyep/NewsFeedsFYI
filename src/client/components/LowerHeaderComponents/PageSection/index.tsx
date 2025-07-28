import * as React from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { UserStore, PageStore } from "../../../stores";
import { Roles } from "common/constants";
import * as styles from './styles.css';

export interface PageSectionProps {
  userStore: UserStore,
  pageStore: PageStore
}

export interface PageSectionState { }

@observer
export class PageSection extends React.Component<PageSectionProps, PageSectionState> {
  /*
  constructor(props: PageSectionProps) {
    super(props);
    // this.handleSave = this.handleSave.bind(this);
  }
  */

  render() {
    const { userStore, pageStore } = this.props;    
    const { currentUser } = userStore;
    const { pages } = pageStore;

    return (
      <div className="col-md-3 mb-2">
        <div className="d-flex align-items-center">
          <span className="me-2">Page:</span>
          <DropdownButton title={pages[0].name} id={pages[0].pageID?.toString()} size="sm">
            {pages.map((page, i) => 
              <Dropdown.Item key={i} eventKey={page.pageID} active={i === 0}>{page.name}</Dropdown.Item>  
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
