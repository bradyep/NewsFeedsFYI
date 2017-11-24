"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// import * as util from 'util';
const logModule = require("debug");
const log = logModule('nffyi-common:Link');
// import errorModule = require('debug');
const error = logModule('nffyi-common:error');
const mobx_1 = require("mobx");
// module.exports = class Note {
class LinkModel {
    constructor(url, name, displayOrder, linkID, userID) {
        this.url = url;
        this.name = name;
        this.displayOrder = displayOrder;
        this.linkID = linkID;
        this.userID = userID;
    }
    get JSON() {
        return JSON.stringify({
            linkID: this.linkID, userID: this.userID, url: this.url, name: this.name, displayOrder: this.displayOrder
        });
    }
    static fromJSON(json) {
        var data = JSON.parse(json);
        var link = new LinkModel(data.url, data.name, data.displayOrder, data.linkID, data.userID);
        log(json + ' => ' + link);
        return link;
    }
}
__decorate([
    mobx_1.observable
], LinkModel.prototype, "displayOrder", void 0);
exports.LinkModel = LinkModel;
; // /class Link
Object.defineProperty(exports, "__esModule", { value: true });
// export = LinkModel;
exports.default = LinkModel;
//# sourceMappingURL=LinkModel.js.map