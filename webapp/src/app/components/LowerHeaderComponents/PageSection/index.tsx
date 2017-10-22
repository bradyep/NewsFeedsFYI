import * as React from 'react';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { UserStore } from "../../../stores";
import { Roles } from "../../../../../../nffyi-common/constants/roles";
import * as styles from './styles.css';

export interface PageSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
  userStore: UserStore
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
    const { userStore } = this.props;    
    const { currentUser } = userStore;

    return (
      <div className="col-md-3">
        <p>Page: </p>
        <DropdownButton title="General News" id="1">
          <MenuItem eventKey="1" active>General News</MenuItem>
          <MenuItem eventKey="2">Development</MenuItem>
          <MenuItem eventKey="3">Design</MenuItem>
        </DropdownButton>
        {currentUser.roleID != Roles.GUEST &&
          <i className={`fa fa-cog ${styles.biggerCog}`} aria-hidden="true"></i>
        }
      </div>
    );
  }
}

export default PageSection;
