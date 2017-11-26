import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { UserStore, PageStore } from "../../../stores";
// import { Roles } from "../../../../../../nffyi-common/constants/roles";
import { Roles } from "../../../constants/common//roles";
import * as styles from './styles.css';

export interface PageSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
  userStore: UserStore,
  pageStore: PageStore
}

export interface PageSectionState {
  /* empty */
}

@observer
export class PageSection extends React.Component<PageSectionProps, PageSectionState> {

  constructor(props?: PageSectionProps, context?: any) {
    super(props, context);
    // this.handleSave = this.handleSave.bind(this);
  }

  /* 
    handleSave(text: string) {
      if (text.length) {
        this.props.addTodo({ text });
      }
    }
   */

  render() {
    const { userStore, pageStore } = this.props;    
    const { currentUser } = userStore;
    const { pages } = pageStore;

    return (
      <div className="col-md-3">
        <p>Page: </p>
        <DropdownButton title={pages[0].name} id={pages[0].pageID.toString()}>
          {pages.map((page, i) => 
            <MenuItem key={i} eventKey={page.pageID} active={i === 0}>{page.name}</MenuItem>  
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
