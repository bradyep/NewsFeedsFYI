import debug = require('debug');
const log = debug('nffyi-rest:links-model');
const error = debug('nffyi-rest:error');
import modelDef = require('./nffyi-sequelize');
import { LinkModel } from '../../common/models';

export function create(link:LinkModel) {
    return modelDef.connectDB('SQLink')
    .then((SQLink: any) => {
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
    .then((SQLink: any) => {
        return SQLink['findOne']({ where: { linkID: link.linkID } })
        .then((linkInstance: any) => {
            if (!linkInstance) {
                // throw new Error("No link found for linkID " + linkID);
                return null;
            } else {
                return linkInstance.update({
                    url: link.url,
                    name: link.name,
                    displayOrder: link.displayOrder,
                });
            }
        });
    });
};

export function read(linkID: any) {
    return modelDef.connectDB('SQLink')
    .then((SQLink: any) => {
        return SQLink['findOne']({ where: { linkID } })
        .then((link: any) => {
            if (!link) {
                // throw new Error("No link found for " + linkID);
                return null;
            } else {
                return new LinkModel(link.url, link.name, link.displayOrder, link.linkID, link.userID);
            }
        });
    });
};

export function destroy(linkID: any) {
    return modelDef.connectDB('SQLink')
    .then((SQLink: any) => {
        return SQLink['findOne']({ where: { linkID } })
        .then((link: any) => {
            if (!link) return null;
            else return link.destroy();
        });
    });
};

export function keylist(userID:number) {
    return modelDef.connectDB('SQLink')
    .then((SQLink: any) => {
        // Admin User gets ALL Links
        if (userID === 2) {
            return SQLink['findAll']({ attributes: [ 'linkID' ] })
            .then((links: any) => {
                return links.map((link: any) => link.linkID);
            });
        } else {
            return SQLink['findAll']({ where: { userID }, attributes: [ 'linkID' ] })
            .then((links: any) => {
                return links.map((link: any) => link.linkID);
            });
        }
    });
};

export function count() {
    return modelDef.connectDB('SQLink')
    .then((SQLink: any) => {
        return SQLink['count']()
        .then((count: any) => {
            log('COUNT ' + count);
            return count;
        });
    });
};
