"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:Link');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// module.exports = class Note {
class Link {
    constructor(url, name, displayOrder, linkID, userID) {
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
    static fromJSON(json) {
        var data = JSON.parse(json);
        var link = new Link(data.url, data.name, data.displayOrder, data.linkID, data.userID);
        log(json + ' => ' + util.inspect(link));
        return link;
    }
}
; // /class Link
module.exports = Link;
//# sourceMappingURL=link.js.map