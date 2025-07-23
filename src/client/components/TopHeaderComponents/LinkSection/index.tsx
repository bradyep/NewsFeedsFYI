import * as React from "react";
import { Roles } from "common/constants";
import * as styles from "./styles.css";
// import { STORE_LINK } from "../../../constants/stores";
import { LinkStore, UserStore } from "client/stores";
import { observer } from 'mobx-react';

export interface LinkSectionProps {
  linksStore: LinkStore,
  userStore: UserStore
}

export interface LinkSectionState { }

@observer
export class LinkSection extends React.Component<LinkSectionProps, LinkSectionState> {

  constructor(props: LinkSectionProps) {
    super(props);
  }

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
