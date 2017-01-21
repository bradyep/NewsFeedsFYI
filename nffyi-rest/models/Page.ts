import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:Page');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

// module.exports = class Note {
class Page {
    pageID: number; // PK
    userID: number; // FK
    name: string;
    displayOrder: number;

    constructor(name:string, displayOrder:number, userID?:number, pageID?:number) {
        this.name = name;
        this.displayOrder = displayOrder;
        this.userID = userID;
        this.pageID = pageID
    }
    
    get JSON() {
        return JSON.stringify({
            pageID: this.pageID, userID: this.userID, name: this.name, displayOrder: this.displayOrder
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var page = new Page(data.name, data.displayOrder, data.userID, data.pageID);
        log(json +' => '+ util.inspect(page));
        return page;
    }
}; // /class Page

export = Page;
