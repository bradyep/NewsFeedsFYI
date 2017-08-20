import * as React from 'react';
import * as styles from './styles.css';
// import { TodoTextInput } from '../TodoTextInput';
// import { TodoModel } from '../../models/TodoModel';

export interface ProfileSectionProps {
  // addTodo: (todo: Partial<TodoModel>) => any;
}

export interface ProfileSectionState {
  /* empty */
}

export class ProfileSection extends React.Component<ProfileSectionProps, ProfileSectionState> {

  constructor(props?: ProfileSectionProps, context?: any) {
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
    return (
      <div className={styles.profileSection}>
        <i className="fa fa-user fa-2x" aria-hidden="true"></i>
        <p>
          Sign In To Customize
        </p>
      </div>
    );
  }
}

export default ProfileSection;
