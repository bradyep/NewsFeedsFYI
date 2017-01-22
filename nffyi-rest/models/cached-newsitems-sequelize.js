"use strict";
const logModule = require("debug");
const log = logModule('nffyi-rest:cachedNewsItems-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const modelDef = require("./nffyi-sequelize");
const CachedNewsItem = require("./CachedNewsItem");
function create(cachedNewsItem) {
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
}
exports.create = create;
;
function update(cachedNewsItem) {
    return modelDef.connectDB('SQCachedNewsItem')
        .then(SQCachedNewsItem => {
        return SQCachedNewsItem['find']({ where: { cachedNewsItemID: cachedNewsItem.cachedNewsItemID } })
            .then(cachedNewsItem => {
            if (!cachedNewsItem) {
                // throw new Error("No cachedNewsItem found for cachedNewsItemID " + cachedNewsItemID);
                return null;
            }
            else {
                return cachedNewsItem.updateAttributes({
                    feedSourceID: cachedNewsItem.feedSourceID,
                    title: cachedNewsItem.title,
                    link: cachedNewsItem.link,
                    description: cachedNewsItem.description
                });
            }
        });
    });
}
exports.update = update;
;
function read(cachedNewsItemID) {
    return modelDef.connectDB('SQCachedNewsItem')
        .then(SQCachedNewsItem => {
        return SQCachedNewsItem['find']({ where: { cachedNewsItemID } })
            .then(cachedNewsItem => {
            if (!cachedNewsItem) {
                // throw new Error("No cachedNewsItem found for " + cachedNewsItemID);
                return null;
            }
            else {
                return new CachedNewsItem(cachedNewsItem.title, cachedNewsItem.link, cachedNewsItem.description, cachedNewsItem.feedSourceID, cachedNewsItem.cachedNewsItemID);
            }
        });
    });
}
exports.read = read;
;
function destroy(cachedNewsItemID) {
    return modelDef.connectDB('SQCachedNewsItem')
        .then(SQCachedNewsItem => {
        return SQCachedNewsItem['find']({ where: { cachedNewsItemID } })
            .then(cachedNewsItem => {
            if (!cachedNewsItem)
                return null;
            else
                return cachedNewsItem.destroy();
        });
    });
}
exports.destroy = destroy;
;
function keylist() {
    return modelDef.connectDB('SQCachedNewsItem')
        .then(SQCachedNewsItem => {
        return SQCachedNewsItem['findAll']({ attributes: ['cachedNewsItemID'] })
            .then(cachedNewsItems => {
            return cachedNewsItems.map(cachedNewsItem => cachedNewsItem.cachedNewsItemID);
        });
    });
}
exports.keylist = keylist;
;
function count() {
    return modelDef.connectDB('SQCachedNewsItem')
        .then(SQCachedNewsItem => {
        return SQCachedNewsItem['count']()
            .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
}
exports.count = count;
;
//# sourceMappingURL=cached-newsitems-sequelize.js.map