import * as React from 'react';
import styles from './styles.css';

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
    const debugStyle = process.env.DEBUG_LAYOUT === 'true' ? { backgroundColor: '#f5f5f5', padding: '8px' } : {};

    return (
      <div className={styles.footer} style={debugStyle}>
        <p>&copy; Syntonic Studios {copyrightYear}</p>
      </div>
    );
  }
}

export default Copyright;
