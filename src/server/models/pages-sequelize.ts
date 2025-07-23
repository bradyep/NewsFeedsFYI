import debug = require('debug');
const log = debug('nffyi-rest:pages-model');
const error = debug('nffyi-rest:error');
import modelDef = require('./nffyi-sequelize');
import { PageModel } from 'common/models';

export function create(page:PageModel) {
    return modelDef.connectDB('SQPage')
    .then((SQPage: any) => {
        return SQPage['create']({
            // pageID: page.pageID, // Auto-Generated
            userID: page.userID,
            name: page.name,
            displayOrder: page.displayOrder
        });
    });
};

export function update(page:PageModel) {
    return modelDef.connectDB('SQPage')
    .then((SQPage: any) => {
        return SQPage['find']({ where: { pageID: page.pageID } })
        .then((page: any) => {
            if (!page) {
                // throw new Error("No page found for pageID " + pageID);
                return null;
            } else {
                return page.updateAttributes({
                    name: page.name,
                    displayOrder: page.displayOrder,
                });
            }
        });
    });
};

export function read(pageID: any) {
    return modelDef.connectDB('SQPage')
    .then((SQPage: any) => {
        return SQPage['find']({ where: { pageID } })
        .then((page: any) => {
            if (!page) {
                // throw new Error("No page found for " + pageID);
                return null;
            } else {
                return new PageModel(page.name, page.displayOrder, page.userID, page.pageID);
            }
        });
    });
};

export function destroy(pageID: any) {
    return modelDef.connectDB('SQPage')
    .then((SQPage: any) => {
        return SQPage['find']({ where: { pageID } })
        .then((page: any) => {
            if (!page) return null;
            else return page.destroy();
        });
    });
};

export function keylist(userID:number) {
    return modelDef.connectDB('SQPage')
    .then((SQPage: any) => {
        return SQPage['findAll']({ where: { userID }, attributes: [ 'pageID' ] })
        .then((pages: any) => {
            return pages.map((page: any) => page.pageID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQPage')
    .then((SQPage: any) => {
        return SQPage['count']()
        .then((count: any) => {
            log('COUNT ' + count);
            return count;
        });
    });
};
