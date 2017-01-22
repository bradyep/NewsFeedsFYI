import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:UserFeed');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

// module.exports = class Note {
class UserFeed {
    feedSourceID: number; // FK
    pageID: number; // FK
    column: number;
    displayOrder: number;
    name: string;
    itemDisplayCount: number;

    constructor(column:number, displayOrder:number, name:string, itemDisplayCount:number, pageID?:number, feedSourceID?:number) {
        this.column = column;
        this.displayOrder = displayOrder;
        this.name = name;
        this.itemDisplayCount = itemDisplayCount;
        this.pageID = pageID;
        this.feedSourceID = feedSourceID;
    }
    
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, pageID: this.pageID, column: this.column, displayOrder: this.displayOrder, name: this.name, itemDisplayCount: this.itemDisplayCount
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var userFeed = new UserFeed(data.column, data.displayOrder, data.name, data.itemDisplayCount, data.pageID, data.feedSourceID);
        log(json +' => '+ util.inspect(userFeed));
        return userFeed;
    }
}; // /class UserFeed

export = UserFeed;
