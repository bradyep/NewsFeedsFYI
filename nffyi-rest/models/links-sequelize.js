"use strict";
const logModule = require("debug");
const log = logModule('nffyi-rest:links-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const modelDef = require("./nffyi-sequelize");
// import LinkModel = require('./link');
// import { LinkModel } from '../../nffyi-common/models';
// import { LinkModel } from './common';
const nffyi_common_1 = require("nffyi-common");
function create(link) {
    return modelDef.connectDB('SQLink')
        .then(SQLink => {
        return SQLink['create']({
            // linkID: link.linkID, // Auto-Generated
            userID: link.userID,
            url: link.url,
            name: link.name,
            displayOrder: link.displayOrder
        });
    });
}
exports.create = create;
;
function update(link) {
    return modelDef.connectDB('SQLink')
        .then(SQLink => {
        return SQLink['find']({ where: { linkID: link.linkID } })
            .then(link => {
            if (!link) {
                // throw new Error("No link found for linkID " + linkID);
                return null;
            }
            else {
                return link.updateAttributes({
                    url: link.url,
                    name: link.name,
                    displayOrder: link.displayOrder,
                });
            }
        });
    });
}
exports.update = update;
;
function read(linkID) {
    return modelDef.connectDB('SQLink')
        .then(SQLink => {
        return SQLink['find']({ where: { linkID } })
            .then(link => {
            if (!link) {
                // throw new Error("No link found for " + linkID);
                return null;
            }
            else {
                return new nffyi_common_1.LinkModel(link.url, link.name, link.displayOrder, link.linkID, link.userID);
            }
        });
    });
}
exports.read = read;
;
function destroy(linkID) {
    return modelDef.connectDB('SQLink')
        .then(SQLink => {
        return SQLink['find']({ where: { linkID } })
            .then(link => {
            if (!link)
                return null;
            else
                return link.destroy();
        });
    });
}
exports.destroy = destroy;
;
function keylist(userID) {
    return modelDef.connectDB('SQLink')
        .then(SQLink => {
        // Admin User gets ALL Links
        if (userID === 2) {
            return SQLink['findAll']({ attributes: ['linkID'] })
                .then(links => {
                return links.map(link => link.linkID);
            });
        }
        else {
            return SQLink['findAll']({ where: { userID }, attributes: ['linkID'] })
                .then(links => {
                return links.map(link => link.linkID);
            });
        }
    });
}
exports.keylist = keylist;
;
function count() {
    return modelDef.connectDB('SQLink')
        .then(SQLink => {
        return SQLink['count']()
            .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
}
exports.count = count;
;
//# sourceMappingURL=links-sequelize.js.map