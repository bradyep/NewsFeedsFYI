"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:UserFeed');
// import errorModule = require('debug');
const error = logModule('nffyi-rest:error');
const mobx_1 = require("mobx");
// module.exports = class Note {
class UserFeedModel {
    // Cannot use the syntax below
    // @observable public newsItems: CachedNewsItemModel[];
    constructor(column, displayOrder, name, itemDisplayCount, pageID, feedSourceID) {
        this.column = column;
        this.displayOrder = displayOrder;
        this.name = name;
        this.itemDisplayCount = itemDisplayCount;
        this.pageID = pageID;
        this.feedSourceID = feedSourceID;
        this.newsItems = [];
    }
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, pageID: this.pageID, column: this.column, displayOrder: this.displayOrder, name: this.name, itemDisplayCount: this.itemDisplayCount
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var userFeed = new UserFeedModel(data.column, data.displayOrder, data.name, data.itemDisplayCount, data.pageID, data.feedSourceID);
        log(json + ' => ' + util.inspect(userFeed, null));
        return userFeed;
    }
}
__decorate([
    mobx_1.observable
], UserFeedModel.prototype, "pageID", void 0);
__decorate([
    mobx_1.observable
], UserFeedModel.prototype, "column", void 0);
__decorate([
    mobx_1.observable
], UserFeedModel.prototype, "displayOrder", void 0);
__decorate([
    mobx_1.observable
], UserFeedModel.prototype, "name", void 0);
__decorate([
    mobx_1.observable
], UserFeedModel.prototype, "itemDisplayCount", void 0);
__decorate([
    mobx_1.observable
], UserFeedModel.prototype, "newsItems", void 0);
exports.UserFeedModel = UserFeedModel;
; // /class UserFeed
Object.defineProperty(exports, "__esModule", { value: true });
// export = UserFeed;
exports.default = UserFeedModel;
//# sourceMappingURL=UserFeedModel.js.map