import logModule = require('debug');
  const log = logModule('nffyi-rest:pages-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');
import modelDef = require('./nffyi-sequelize');
import { PageModel } from '../../common/models';

export function create(page:PageModel) {
    return modelDef.connectDB('SQPage')
    .then(SQPage => {
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
    .then(SQPage => {
        return SQPage['find']({ where: { pageID: page.pageID } })
        .then(page => {
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

export function read(pageID) {
    return modelDef.connectDB('SQPage')
    .then(SQPage => {
        return SQPage['find']({ where: { pageID } })
        .then(page => {
            if (!page) {
                // throw new Error("No page found for " + pageID);
                return null;
            } else {
                return new PageModel(page.name, page.displayOrder, page.userID, page.pageID);
            }
        });
    });
};

export function destroy(pageID) {
    return modelDef.connectDB('SQPage')
    .then(SQPage => {
        return SQPage['find']({ where: { pageID } })
        .then(page => {
            if (!page) return null;
            else return page.destroy();
        });
    });
};

export function keylist(userID:number) {
    return modelDef.connectDB('SQPage')
    .then(SQPage => {
        return SQPage['findAll']({ where: { userID }, attributes: [ 'pageID' ] })
        .then(pages => {
            return pages.map(page => page.pageID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQPage')
    .then(SQPage => {
        return SQPage['count']()
        .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};
