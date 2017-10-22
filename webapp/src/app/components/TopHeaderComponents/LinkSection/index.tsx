import * as React from "react";
import { Roles } from "../../../../../../nffyi-common/constants/roles";
import * as styles from "./styles.css";
import { STORE_LINK } from "../../../constants/stores";
import { LinkStore, UserStore } from "../../../stores";
import { observer } from 'mobx-react';

export interface LinkSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
  linksStore: LinkStore,
  userStore: UserStore
}

export interface LinkSectionState {
  /* empty */
}

@observer
export class LinkSection extends React.Component<LinkSectionProps, LinkSectionState> {

  constructor(props?: LinkSectionProps, context?: any) {
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
    const { linksStore, userStore } = this.props;
    const { links } = linksStore;
    const { currentUser } = userStore;

    return (
      <div className={styles.linkList}>
        <ol>
          {links.map(link =>
            <li key={link.linkID}>
              <a href={link.url} target="_blank">{link.name}</a>
            </li>
          )}
          <li>
            {currentUser.roleID != Roles.GUEST &&
              <i className="fa fa-cog" aria-hidden="true"></i>
            }
          </li>
        </ol>
      </div>
    );
  }
}

export default LinkSection;
