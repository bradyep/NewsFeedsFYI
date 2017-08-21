"use strict";
const logModule = require("debug");
const log = logModule('nffyi-rest:userFeeds-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
// import FeedHandler = require('./FeedHandler');
const FeedHandler_1 = require("./FeedHandler");
const modelDef = require("./nffyi-sequelize");
// import UserFeed = require('./UserFeed');
const models_1 = require("../../nffyi-common/models");
function create(userFeed) {
    return modelDef.connectDB('SQUserFeed')
        .then(SQUserFeed => {
        return SQUserFeed['create']({
            column: userFeed.column,
            displayOrder: userFeed.displayOrder,
            name: userFeed.name,
            itemDisplayCount: userFeed.itemDisplayCount,
            pageID: userFeed.pageID,
            feedSourceID: userFeed.feedSourceID
        });
    });
}
exports.create = create;
;
function update(userFeed) {
    return modelDef.connectDB('SQUserFeed')
        .then(SQUserFeed => {
        return SQUserFeed['find']({ where: {
                feedSourceID: userFeed.feedSourceID,
                pageID: userFeed.pageID
            } })
            .then(userFeed => {
            if (!userFeed) {
                // throw new Error("No userFeed found for userFeedID " + userFeedID);
                return null;
            }
            else {
                return userFeed.updateAttributes({
                    column: userFeed.column,
                    displayOrder: userFeed.displayOrder,
                    name: userFeed.name,
                    itemDisplayCount: userFeed.itemDisplayCount
                });
            }
        });
    });
}
exports.update = update;
;
function read(feedSourceID, pageID) {
    return modelDef.connectDB('SQUserFeed')
        .then(SQUserFeed => {
        return SQUserFeed['find']({ where: { feedSourceID, pageID } })
            .then(userFeed => {
            if (!userFeed) {
                // throw new Error("No userFeed found for " + userFeedID);
                return null;
            }
            else {
                // Since we are asking for a UserFeed, we probably also want the actual
                // feed itself
                // Need to get the feed's URL here
                var url = 'http://feeds.feedwrench.com/JavaScriptJabber.rss';
                FeedHandler_1.default.parse(url).then(function (items) {
                    items.forEach(function (item) {
                        console.log('title: ', item.title);
                    });
                }).catch(function (error) {
                    console.log('error: ', error);
                });
                return new models_1.UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID);
            }
        });
    });
}
exports.read = read;
;
function destroy(feedSourceID, pageID) {
    return modelDef.connectDB('SQUserFeed')
        .then(SQUserFeed => {
        return SQUserFeed['find']({ where: { feedSourceID, pageID } })
            .then(userFeed => {
            if (!userFeed)
                return null;
            else
                return userFeed.destroy();
        });
    });
}
exports.destroy = destroy;
;
function keylist(pageID) {
    return modelDef.connectDB('SQUserFeed')
        .then(SQUserFeed => {
        return SQUserFeed['findAll']({ where: { pageID }, attributes: ['feedSourceID'] })
            .then(userFeeds => {
            return userFeeds.map(userFeed => userFeed.feedSourceID);
        });
    });
}
exports.keylist = keylist;
;
function count() {
    return modelDef.connectDB('SQUserFeed')
        .then(SQUserFeed => {
        return SQUserFeed['count']()
            .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
}
exports.count = count;
;
//# sourceMappingURL=userFeeds-sequelize.js.map