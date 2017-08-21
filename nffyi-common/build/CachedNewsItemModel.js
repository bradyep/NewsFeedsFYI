"use strict";
var util = require("util");
var logModule = require("debug");
var log = logModule('nffyi-rest:CachedNewsItem');
var error = logModule('nffyi-rest:error');
var CachedNewsItemModel = (function () {
    function CachedNewsItemModel(title, link, description, feedSourceID, cachedNewsItemID) {
        this.title = title;
        this.link = link;
        this.description = description;
        this.feedSourceID = feedSourceID;
        this.cachedNewsItemID = cachedNewsItemID;
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
        log(json + ' => ' + util.inspect(cachedNewsItem));
        return cachedNewsItem;
    };
    return CachedNewsItemModel;
}());
exports.CachedNewsItemModel = CachedNewsItemModel;
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CachedNewsItemModel;
//# sourceMappingURL=CachedNewsItemModel.js.map