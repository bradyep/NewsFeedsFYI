import * as React from 'react';
import * as styles from './styles.css';

export interface CopyrightProps { }
export interface CopyrightState { }

export class Copyright extends React.Component<CopyrightProps, CopyrightState> {
  /*
  constructor(props: CopyrightProps) {
    super(props);
    // this.handleSave = this.handleSave.bind(this);
  }
  */

  render() {
    const copyrightYear:string = new Date().getFullYear().toString();

    return (
      <div className={styles.footer}>
        <p>&copy; Syntonic Studios {copyrightYear}</p>
      </div>
    );
  }
}

export default Copyright;
