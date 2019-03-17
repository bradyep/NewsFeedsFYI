"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logModule = require("debug");
const log = logModule('nffyi-rest:pages-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const modelDef = require("./nffyi-sequelize");
// import PageModel = require('./page');
// import { PageModel } from '../../nffyi-common/models';
// import { PageModel } from './common';
const nffyi_common_1 = require("nffyi-common");
function create(page) {
    return modelDef.connectDB('SQPage')
        .then(SQPage => {
        return SQPage['create']({
            // pageID: page.pageID, // Auto-Generated
            userID: page.userID,
            name: page.name,
            displayOrder: page.displayOrder
        });
    });
}
exports.create = create;
;
function update(page) {
    return modelDef.connectDB('SQPage')
        .then(SQPage => {
        return SQPage['find']({ where: { pageID: page.pageID } })
            .then(page => {
            if (!page) {
                // throw new Error("No page found for pageID " + pageID);
                return null;
            }
            else {
                return page.updateAttributes({
                    name: page.name,
                    displayOrder: page.displayOrder,
                });
            }
        });
    });
}
exports.update = update;
;
function read(pageID) {
    return modelDef.connectDB('SQPage')
        .then(SQPage => {
        return SQPage['find']({ where: { pageID } })
            .then(page => {
            if (!page) {
                // throw new Error("No page found for " + pageID);
                return null;
            }
            else {
                return new nffyi_common_1.PageModel(page.name, page.displayOrder, page.userID, page.pageID);
            }
        });
    });
}
exports.read = read;
;
function destroy(pageID) {
    return modelDef.connectDB('SQPage')
        .then(SQPage => {
        return SQPage['find']({ where: { pageID } })
            .then(page => {
            if (!page)
                return null;
            else
                return page.destroy();
        });
    });
}
exports.destroy = destroy;
;
function keylist(userID) {
    return modelDef.connectDB('SQPage')
        .then(SQPage => {
        return SQPage['findAll']({ where: { userID }, attributes: ['pageID'] })
            .then(pages => {
            return pages.map(page => page.pageID);
        });
    });
}
exports.keylist = keylist;
;
function count() {
    return modelDef.connectDB('SQPage')
        .then(SQPage => {
        return SQPage['count']()
            .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
}
exports.count = count;
;
//# sourceMappingURL=pages-sequelize.js.map