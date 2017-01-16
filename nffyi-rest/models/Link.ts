import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:Link');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

// module.exports = class Note {
class Link {
    linkID: number; // PK
    userID: number; // FK
    url: string;
    name: string;
    displayOrder: number;

    constructor(url:string, name:string, displayOrder:number, linkID?:number, userID?:number) {
        this.url = url;
        this.name = name;
        this.displayOrder = displayOrder;
        this.linkID = linkID
        this.userID = userID;
    }
    
    get JSON() {
        return JSON.stringify({
            linkID: this.linkID, userID: this.userID, url: this.url, name: this.name, displayOrder: this.displayOrder
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var link = new Link(data.url, data.name, data.displayOrder, data.linkID, data.userID);
        log(json +' => '+ util.inspect(link));
        return link;
    }
}; // /class Link

export = Link;
