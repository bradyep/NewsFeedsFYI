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
var util = require("util");
var logModule = require("debug");
var log = logModule('nffyi-rest:Link');
var error = logModule('nffyi-rest:error');
var mobx_1 = require("mobx");
var LinkModel = (function () {
    function LinkModel(url, name, displayOrder, linkID, userID) {
        this.url = url;
        this.name = name;
        this.displayOrder = displayOrder;
        this.linkID = linkID;
        this.userID = userID;
    }
    Object.defineProperty(LinkModel.prototype, "JSON", {
        get: function () {
            return JSON.stringify({
                linkID: this.linkID, userID: this.userID, url: this.url, name: this.name, displayOrder: this.displayOrder
            });
        },
        enumerable: true,
        configurable: true
    });
    LinkModel.fromJSON = function (json) {
        var data = JSON.parse(json);
        var link = new LinkModel(data.url, data.name, data.displayOrder, data.linkID, data.userID);
        log(json + ' => ' + util.inspect(link));
        return link;
    };
    return LinkModel;
}());
__decorate([
    mobx_1.observable,
    __metadata("design:type", Number)
], LinkModel.prototype, "displayOrder", void 0);
exports.LinkModel = LinkModel;
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LinkModel;
//# sourceMappingURL=LinkModel.js.map