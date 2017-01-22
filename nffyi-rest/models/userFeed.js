"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:UserFeed');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// module.exports = class Note {
class UserFeed {
    constructor(column, displayOrder, name, itemDisplayCount, pageID, feedSourceID) {
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
        log(json + ' => ' + util.inspect(userFeed));
        return userFeed;
    }
}
; // /class UserFeed
module.exports = UserFeed;
//# sourceMappingURL=UserFeed.js.map