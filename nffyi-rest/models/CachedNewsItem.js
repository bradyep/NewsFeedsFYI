"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:CachedNewsItem');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
class CachedNewsItem {
    constructor(title, link, description, feedSourceID, cachedNewsItemID) {
        this.title = title;
        this.link = link;
        this.description = description;
        this.feedSourceID = feedSourceID;
        this.cachedNewsItemID = cachedNewsItemID;
    }
    get JSON() {
        return JSON.stringify({
            cachedNewsItemID: this.cachedNewsItemID, feedSourceID: this.feedSourceID, title: this.title, link: this.link, description: this.description
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var cachedNewsItem = new CachedNewsItem(data.title, data.link, data.description, data.feedSourceID, data.cachedNewsItemID);
        log(json + ' => ' + util.inspect(cachedNewsItem));
        return cachedNewsItem;
    }
}
; // /class CachedNewsItem
module.exports = CachedNewsItem;
//# sourceMappingURL=CachedNewsItem.js.map