"use strict";
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:CachedNewsItem');
// import * as errorModule from 'debug';
const error = logModule('nffyi-rest:error');
class CachedNewsItemModel {
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
        var cachedNewsItem = new CachedNewsItemModel(data.title, data.link, data.description, data.feedSourceID, data.cachedNewsItemID);
        log(json + ' => ' + util.inspect(cachedNewsItem));
        return cachedNewsItem;
    }
}
exports.CachedNewsItemModel = CachedNewsItemModel;
; // /class CachedNewsItem
Object.defineProperty(exports, "__esModule", { value: true });
// export = CachedNewsItemModel;
exports.default = CachedNewsItemModel;
//# sourceMappingURL=CachedNewsItemModel.js.map