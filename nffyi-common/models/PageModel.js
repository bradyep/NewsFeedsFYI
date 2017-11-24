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
var log = logModule('nffyi-common:Page');
var error = logModule('nffyi-common:error');
var mobx_1 = require("mobx");
var _1 = require("./");
var PageModel = (function () {
    function PageModel(name, displayOrder, userID, pageID) {
        this.name = name;
        this.displayOrder = displayOrder;
        this.userID = userID;
        this.pageID = pageID;
    }
    PageModel.prototype.test = function () {
        console.log('hey!');
    };
    PageModel.prototype.addUserFeed = function (userFeed) {
        this.userFeeds.push(userFeed);
    };
    Object.defineProperty(PageModel.prototype, "JSON", {
        get: function () {
            return JSON.stringify({
                pageID: this.pageID, userID: this.userID, name: this.name, displayOrder: this.displayOrder
            });
        },
        enumerable: true,
        configurable: true
    });
    PageModel.fromJSON = function (json) {
        var data = JSON.parse(json);
        var page = new PageModel(data.name, data.displayOrder, data.userID, data.pageID);
        log(json + ' => ' + page);
        return page;
    };
    __decorate([
        mobx_1.observable,
        __metadata("design:type", String)
    ], PageModel.prototype, "name", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Number)
    ], PageModel.prototype, "displayOrder", void 0);
    __decorate([
        mobx_1.observable,
        __metadata("design:type", Array)
    ], PageModel.prototype, "userFeeds", void 0);
    __decorate([
        mobx_1.action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [_1.UserFeedModel]),
        __metadata("design:returntype", void 0)
    ], PageModel.prototype, "addUserFeed", null);
    return PageModel;
}());
exports.PageModel = PageModel;
;
exports.default = PageModel;
//# sourceMappingURL=PageModel.js.map