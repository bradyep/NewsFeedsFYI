"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:FeedSource');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// module.exports = class Note {
class FeedSourceModel {
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
        var feedSource = new FeedSourceModel(data.url, data.cachedTitle, data.cachedWebsiteURL, data.lastCachedDate, data.feedSourceID);
        log(json + ' => ' + util.inspect(feedSource));
        return feedSource;
    }
}
exports.FeedSourceModel = FeedSourceModel;
; // /class FeedSource
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeedSourceModel;
//# sourceMappingURL=FeedSourceModel.js.map