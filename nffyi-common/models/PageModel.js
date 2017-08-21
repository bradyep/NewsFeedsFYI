"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const util = require("util");
const logModule = require("debug");
const log = logModule('nffyi-rest:Page');
// import errorModule = require('debug');
const error = logModule('nffyi-rest:error');
const mobx_1 = require("mobx");
// module.exports = class Note {
class PageModel {
    constructor(name, displayOrder, userID, pageID) {
        this.name = name;
        this.displayOrder = displayOrder;
        this.userID = userID;
        this.pageID = pageID;
    }
    get JSON() {
        return JSON.stringify({
            pageID: this.pageID, userID: this.userID, name: this.name, displayOrder: this.displayOrder
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var page = new PageModel(data.name, data.displayOrder, data.userID, data.pageID);
        log(json + ' => ' + util.inspect(page));
        return page;
    }
}
__decorate([
    mobx_1.observable
], PageModel.prototype, "name", void 0);
__decorate([
    mobx_1.observable
], PageModel.prototype, "displayOrder", void 0);
exports.PageModel = PageModel;
; // /class Page
Object.defineProperty(exports, "__esModule", { value: true });
// export = Page;
exports.default = PageModel;
//# sourceMappingURL=PageModel.js.map