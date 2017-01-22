"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:FeedSource');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// module.exports = class Note {
class FeedSource {
    constructor(url, cachedTitle, cachedWebsiteURL, lastCachedDate, feedSourceID) {
        this.url = url;
        this.cachedTitle = cachedTitle;
        this.cachedWebsiteURL = cachedWebsiteURL;
        this.lastCachedDate = lastCachedDate;
        this.feedSourceID = feedSourceID;
    }
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, url: this.url, cachedTitle: this.cachedTitle, cachedWebsiteURL: this.cachedWebsiteURL, lastCachedDate: this.lastCachedDate
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var feedSource = new FeedSource(data.url, data.cachedTitle, data.cachedWebsiteURL, data.lastCachedDate, data.feedSourceID);
        log(json + ' => ' + util.inspect(feedSource));
        return feedSource;
    }
}
; // /class FeedSource
module.exports = FeedSource;
//# sourceMappingURL=FeedSource.js.map