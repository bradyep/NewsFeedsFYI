"use strict";
const logModule = require("debug");
const log = logModule('nffyi-rest:userFeeds-model');
// import errorModule = require('debug');
const error = logModule('nffyi-rest:error');
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
                /*
                                // Since we are asking for a UserFeed, we probably also want the actual
                                // feed itself
                                
                                // Need to get the feed's URL here
                                var url = 'http://feeds.feedwrench.com/JavaScriptJabber.rss';
                                
                                FeedHandler.parse(url).then(function (items:Array<any>) {
                                    items.forEach(function (item) {
                                    console.log('title: ', item.title);
                                    });
                                }).catch(function (error) {
                                    console.log('error: ', error);
                                });
                 */
                let userFeedModel = new models_1.UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID);
                /*
                                // Get the CachedNewsItems for this UserFeed
                                let getKeyList = function(feedSourceID:number) {
                                    return cachedNewsItemModel.keylist(feedSourceID)
                                    .then(keylist => {
                                        var keyPromises = keylist.map(key => {
                                            return cachedNewsItemModel.read(key)
                                            .then(cachedNewsItem => {
                                                return new CachedNewsItemModel (
                                                  cachedNewsItem.title,
                                                  cachedNewsItem.link,
                                                  cachedNewsItem.description,
                                                  cachedNewsItem.feedSourceID,
                                                  cachedNewsItem.cachedNewsItemID
                                                );
                                            });
                                        });
                                        return Promise.all(keyPromises);
                                    });
                                };
                 */
                /*
                                getKeyList(userFeed.feedSourceID)
                                .then((cachedNewsItems:any) => {
                                    userFeedModel.newsItems = cachedNewsItems;
                                });
                                 */
                // Handle Cached News Items
                // let testCNIM = new CachedNewsItemModel("Title", "Link", "Desc", 1, 1);
                // userFeedModel.newsItems.push(testCNIM);
                return userFeedModel;
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