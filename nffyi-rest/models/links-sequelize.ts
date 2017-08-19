import logModule = require('debug');
  const log = logModule('nffyi-rest:links-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');

import modelDef = require('./nffyi-sequelize');
// import LinkModel = require('./link');
import { LinkModel } from '../../nffyi-common/models';

export function create(link:LinkModel) {
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
};

export function update(link:LinkModel) {
    return modelDef.connectDB('SQLink')
    .then(SQLink => {
        return SQLink['find']({ where: { linkID: link.linkID } })
        .then(link => {
            if (!link) {
                // throw new Error("No link found for linkID " + linkID);
                return null;
            } else {
                return link.updateAttributes({
                    url: link.url,
                    name: link.name,
                    displayOrder: link.displayOrder,
                });
            }
        });
    });
};

export function read(linkID) {
    return modelDef.connectDB('SQLink')
    .then(SQLink => {
        return SQLink['find']({ where: { linkID } })
        .then(link => {
            if (!link) {
                // throw new Error("No link found for " + linkID);
                return null;
            } else {
                return new LinkModel(link.url, link.name, link.displayOrder, link.linkID, link.userID);
            }
        });
    });
};

export function destroy(linkID) {
    return modelDef.connectDB('SQLink')
    .then(SQLink => {
        return SQLink['find']({ where: { linkID } })
        .then(link => {
            if (!link) return null;
            else return link.destroy();
        });
    });
};

export function keylist(userID:number) {
    return modelDef.connectDB('SQLink')
    .then(SQLink => {
        // Admin User gets ALL Links
        if (userID === 2) {
            return SQLink['findAll']({ attributes: [ 'linkID' ] })
            .then(links => {
                return links.map(link => link.linkID);
            });
        } else {
            return SQLink['findAll']({ where: { userID }, attributes: [ 'linkID' ] })
            .then(links => {
                return links.map(link => link.linkID);
            });
        }
    });
};

export function count() {
    return modelDef.connectDB('SQLink')
    .then(SQLink => {
        return SQLink['count']()
        .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};
