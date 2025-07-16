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

export interface PageSectionState {
  /* empty */
}

@observer
export class PageSection extends React.Component<PageSectionProps, PageSectionState> {

  constructor(props: PageSectionProps, context?: any) {
    super(props, context);
    // this.handleSave = this.handleSave.bind(this);
  }

  render() {
    const { userStore, pageStore } = this.props;    
    const { currentUser } = userStore;
    const { pages } = pageStore;

    return (
      <div className="col-md-3">
        <p>Page: </p>
        <DropdownButton title={pages[0].name} id={pages[0].pageID?.toString()}>
          {pages.map((page, i) => 
            <Dropdown.Item key={i} eventKey={page.pageID} active={i === 0}>{page.name}</Dropdown.Item>  
          )}
        </DropdownButton>
        {currentUser.roleID != Roles.GUEST &&
          <i className={`fa fa-cog ${styles.biggerCog}`} aria-hidden="true"></i>
        }
      </div>
    );
  }
}

export default PageSection;
