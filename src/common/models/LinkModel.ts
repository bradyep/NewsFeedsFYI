import * as logModule from 'debug';
const log = logModule('nffyi-common:Link');
// const error = logModule('nffyi-common:error');
import { observable } from 'mobx';

export class LinkModel {
    @observable public displayOrder: number;

    constructor(
        public url: string, 
        public name: string, 
        displayOrder: number, 
        public linkID?: number,  // PK
        public userID?: number // FK
    ) {
        this.displayOrder = displayOrder;
    }
    
    get JSON() {
        return JSON.stringify({
            linkID: this.linkID, userID: this.userID, url: this.url, name: this.name, displayOrder: this.displayOrder
        });
    }
    
    static fromJSON(json:string) {
        var data = JSON.parse(json);
        var link = new LinkModel(data.url, data.name, data.displayOrder, data.linkID, data.userID);
        log(json +' => '+ link);
        return link;
    }
}; // /class Link

// export default LinkModel;
