// import * as util from 'util';
import * as logModule from 'debug';
    const log = logModule('nffyi-common:Link');
// import errorModule = require('debug');
    const error = logModule('nffyi-common:error');
import { observable } from 'mobx';

// module.exports = class Note {
export class LinkModel {
    linkID?: number; // PK
    userID?: number; // FK
    url: string;
    name: string;
    @observable public displayOrder: number;

    constructor(url:string, name:string, displayOrder:number, linkID?:number, userID?:number) {
        this.url = url;
        this.name = name;
        this.displayOrder = displayOrder;
        this.linkID = linkID;
        this.userID = userID;
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

// export = LinkModel;
export default LinkModel;
