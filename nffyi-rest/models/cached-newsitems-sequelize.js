"use strict";
const logModule = require("debug");
const log = logModule('nffyi-rest:cachedNewsItems-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const modelDef = require("./nffyi-sequelize");
// import CachedNewsItemModel = require('./CachedNewsItemModel');
const models_1 = require("../../nffyi-common/models");
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
                return new models_1.CachedNewsItemModel(cachedNewsItem.title, cachedNewsItem.link, cachedNewsItem.description, cachedNewsItem.feedSourceID, cachedNewsItem.cachedNewsItemID);
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
// Get Cached News Items By FeedSourceID
function keylist(feedSourceID) {
    return modelDef.connectDB('SQCachedNewsItem')
        .then(SQCachedNewsItem => {
        return SQCachedNewsItem['findAll']({ where: { feedSourceID }, attributes: ['cachedNewsItemID'] })
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