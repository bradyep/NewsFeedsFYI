"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logModule = require("debug");
var log = logModule('nffyi-common:CachedNewsItem');
var error = logModule('nffyi-common:error');
var CachedNewsItemModel = (function () {
    function CachedNewsItemModel(title, link, description, feedSourceID, cachedNewsItemID, feedSourceWebTitle, feedSourceWebURL) {
        this.title = title;
        this.link = link;
        this.description = description;
        this.feedSourceID = feedSourceID;
        this.cachedNewsItemID = cachedNewsItemID;
        this.feedSourceWebTitle = feedSourceWebTitle;
        this.feedSourceWebURL = feedSourceWebURL;
    }
    Object.defineProperty(CachedNewsItemModel.prototype, "JSON", {
        get: function () {
            return JSON.stringify({
                cachedNewsItemID: this.cachedNewsItemID, feedSourceID: this.feedSourceID, title: this.title, link: this.link, description: this.description
            });
        },
        enumerable: true,
        configurable: true
    });
    CachedNewsItemModel.fromJSON = function (json) {
        var data = JSON.parse(json);
        var cachedNewsItem = new CachedNewsItemModel(data.title, data.link, data.description, data.feedSourceID, data.cachedNewsItemID);
        log(json + ' => ' + cachedNewsItem);
        return cachedNewsItem;
    };
    return CachedNewsItemModel;
}());
exports.CachedNewsItemModel = CachedNewsItemModel;
;
exports.default = CachedNewsItemModel;
//# sourceMappingURL=CachedNewsItemModel.js.map