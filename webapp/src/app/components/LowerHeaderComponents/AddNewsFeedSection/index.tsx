import * as React from "react";
import { Roles, ROLE_DB_NAMES } from "../../../../../../nffyi-common/constants/roles";
import { UserStore } from "../../../stores";
import { FormGroup, InputGroup, Button } from "react-bootstrap";
import { observer } from 'mobx-react';

export interface AddNewsFeedSectionProps {
  userStore: UserStore
}

export interface AddNewsFeedSectionState {
  /* empty */
}

@observer
export class AddNewsFeedSection extends React.Component<AddNewsFeedSectionProps, AddNewsFeedSectionState> {

  constructor(props?: AddNewsFeedSectionProps, context?: any) {
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
    const disabled = currentUser.roleID === Roles.GUEST;

    return (
      <div className="col-md-2">
        <Button bsStyle="primary" disabled={disabled}>Add News Feed</Button>
      </div>
    );
  }
}

export default AddNewsFeedSection;
