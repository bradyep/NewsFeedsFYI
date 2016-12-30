"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:CachedNewsItem');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// module.exports = class Note {
class CachedNewsItem {
    constructor(feedSourceID, title, link, summary) {
        this.feedSourceID = feedSourceID;
        this.title = title;
        this.link = link;
        this.summary = summary;
    }
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, title: this.title, link: this.link, summary: this.summary
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var cachedNewsItem = new CachedNewsItem(data.feedSourceID, data.title, data.link, data.summary);
        log(json + ' => ' + util.inspect(cachedNewsItem));
        return cachedNewsItem;
    }
}
exports.CachedNewsItem = CachedNewsItem;
; // /class CachedNewsItem
//# sourceMappingURL=CachedNewsItem.js.map