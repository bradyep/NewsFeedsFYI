import * as React from 'react';
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
      <div>
        <h1>Todos</h1>
      </div>
    );
  }
}

export default ProfileSection;
