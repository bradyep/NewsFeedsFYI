"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var logModule = require("debug");
var log = logModule('nffyi-common:UserFeed');
var error = logModule('nffyi-common:error');
var mobx_1 = require("mobx");
var UserFeedModel = (function () {
    function UserFeedModel(column, displayOrder, name, itemDisplayCount, pageID, feedSourceID, titleURL, newsItems) {
        this.column = column;
        this.displayOrder = displayOrder;
        this.name = name;
        this.itemDisplayCount = itemDisplayCount;
        this.pageID = pageID;
        this.feedSourceID = feedSourceID;
        this.newsItems = newsItems || [];
        this.titleURL = titleURL || "";
    }
    Object.defineProperty(UserFeedModel.prototype, "JSON", {
        get: function () {
            return JSON.stringify({
                feedSourceID: this.feedSourceID, pageID: this.pageID, column: this.column, displayOrder: this.displayOrder, name: this.name, itemDisplayCount: this.itemDisplayCount, newsItems: this.newsItems
            });
        },
        enumerable: true,
        configurable: true
    });
    UserFeedModel.fromJSON = function (json) {
        var data = JSON.parse(json);
        var userFeed = new UserFeedModel(data.column, data.displayOrder, data.name, data.itemDisplayCount, data.pageID, data.feedSourceID, data.titleURL, data.newsItems);
        log(json + ' => ' + userFeed, null);
        return userFeed;
    };
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Number)
    ], UserFeedModel.prototype, "pageID", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Number)
    ], UserFeedModel.prototype, "column", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Number)
    ], UserFeedModel.prototype, "displayOrder", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", String)
    ], UserFeedModel.prototype, "name", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Number)
    ], UserFeedModel.prototype, "itemDisplayCount", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", String)
    ], UserFeedModel.prototype, "titleURL", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Array)
    ], UserFeedModel.prototype, "newsItems", void 0);
    return UserFeedModel;
}());
exports.UserFeedModel = UserFeedModel;
;
exports.default = UserFeedModel;
//# sourceMappingURL=UserFeedModel.js.map