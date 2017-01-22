import logModule = require('debug');
  const log = logModule('nffyi-rest:cachedNewsItems-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');

import modelDef = require('./nffyi-sequelize');
import CachedNewsItem = require('./CachedNewsItem');

export function create(cachedNewsItem:CachedNewsItem) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['create']({
            // cachedNewsItemID: cachedNewsItem.cachedNewsItemID, // Auto-Generated
            feedSourceID: cachedNewsItem.feedSourceID,
            title: cachedNewsItem.title,
            link: cachedNewsItem.link,
            description: cachedNewsItem.description
        });
    });
};

export function update(cachedNewsItem:CachedNewsItem) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['find']({ where: { cachedNewsItemID: cachedNewsItem.cachedNewsItemID } })
        .then(cachedNewsItem => {
            if (!cachedNewsItem) {
                // throw new Error("No cachedNewsItem found for cachedNewsItemID " + cachedNewsItemID);
                return null;
            } else {
                return cachedNewsItem.updateAttributes({
                    feedSourceID: cachedNewsItem.feedSourceID,
                    title: cachedNewsItem.title,
                    link: cachedNewsItem.link,
                    description: cachedNewsItem.description
                });
            }
        });
    });
};

export function read(cachedNewsItemID) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['find']({ where: { cachedNewsItemID } })
        .then(cachedNewsItem => {
            if (!cachedNewsItem) {
                // throw new Error("No cachedNewsItem found for " + cachedNewsItemID);
                return null;
            } else {
                return new CachedNewsItem(cachedNewsItem.title, cachedNewsItem.link, cachedNewsItem.description, cachedNewsItem.feedSourceID, cachedNewsItem.cachedNewsItemID);
            }
        });
    });
};

export function destroy(cachedNewsItemID) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['find']({ where: { cachedNewsItemID } })
        .then(cachedNewsItem => {
            if (!cachedNewsItem) return null;
            else return cachedNewsItem.destroy();
        });
    });
};

export function keylist() {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['findAll']({ attributes: [ 'cachedNewsItemID' ] })
        .then(cachedNewsItems => {
            return cachedNewsItems.map(cachedNewsItem => cachedNewsItem.cachedNewsItemID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['count']()
        .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};
