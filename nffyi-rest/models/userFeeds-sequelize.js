"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const logModule = require("debug");
const log = logModule('nffyi-rest:userFeeds-model');
// import errorModule = require('debug');
const error = logModule('nffyi-rest:error');
// import FeedHandler = require('./FeedHandler');
const FeedHandler_1 = require("./FeedHandler");
const cachedNewsItemModel = require("../models/cached-newsitems-sequelize");
const modelDef = require("./nffyi-sequelize");
// import UserFeed = require('./UserFeed');
const models_1 = require("../../nffyi-common/models");
const newsfeeds_1 = require("../../nffyi-common/constants/newsfeeds");
var VAR_MINUTES_TO_CAHCE_FEED = newsfeeds_1.MINUTES_TO_CAHCE_FEED;
var VAR_MAX_NEWS_ITEMS = newsfeeds_1.MAX_NEWS_ITEMS;
// log(VAR_MINUTES_TO_CAHCE_FEED.toString());
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
        return SQUserFeed['find']({
            where: {
                feedSourceID: userFeed.feedSourceID,
                pageID: userFeed.pageID
            }
        })
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
function getUserFeedAsync(feedSourceID, pageID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const SQUserFeedModel = yield modelDef.connectDB('SQUserFeed');
            let dbUserFeedModel = yield SQUserFeedModel['find']({ where: { feedSourceID, pageID } });
            if (!dbUserFeedModel)
                throw new Error("Cannot find UserFeed for supplied feedSourceID and pageID: " + feedSourceID + ", " + pageID);
            let userFeedModel = new models_1.UserFeedModel(dbUserFeedModel.column, dbUserFeedModel.displayOrder, dbUserFeedModel.name, dbUserFeedModel.itemDisplayCount, dbUserFeedModel.pageID, dbUserFeedModel.feedSourceID, "#");
            return userFeedModel;
        }
        catch (err) {
            error("Error Calling getUserFeedAsync: " + err);
        }
    });
}
exports.getUserFeedAsync = getUserFeedAsync;
function readAsync(feedSourceID, pageID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const SQFeedSourceModel = yield modelDef.connectDB('SQFeedSource');
            let feedSourceModel = yield SQFeedSourceModel['find']({ where: { feedSourceID } });
            if (!feedSourceModel)
                throw new Error("Cannot find FeedSource for supplied feedSourceID and pageID: " + feedSourceID + ", " + pageID);
            // Determine whether FeedSource's cache is up to date
            const now = new Date();
            const { lastCachedDate } = feedSourceModel;
            const diffInMilliseconds = now.getTime() - lastCachedDate.getTime();
            const diffInMinutes = (Math.floor(diffInMilliseconds / (1000 * 60))) - 300; // The 300 is for time zone shit I guess
            if (diffInMinutes > VAR_MINUTES_TO_CAHCE_FEED) {
                log("[CACHE] Cache is out of date, fetching updated newsfeed");
                const userFeedModel = yield getUserFeedAsync(feedSourceID, pageID);
                return userFeedModel;
            }
            else {
                log("[CACHE] Cache is up to date, fetching from cache");
                const userFeedModel = yield getUserFeedAsync(feedSourceID, pageID);
                return userFeedModel;
            }
        }
        catch (err) {
            error("Error Calling readAsync: " + err);
        }
    });
}
exports.readAsync = readAsync;
function read(feedSourceID, pageID) {
    // First check to see if the FeedSource we are requesting needs to be updated
    return modelDef.connectDB('SQFeedSource')
        .then(SQFeedSourceModel => {
        return SQFeedSourceModel['find']({ where: { feedSourceID } })
            .then((feedSource) => {
            if (!feedSource) {
                // throw new Error("No feedSource found for " + feedSourceID);
                error("No feedSource found for: " + feedSourceID);
                return null;
            }
            else {
                const now = new Date();
                const { lastCachedDate } = feedSource;
                const diffInMilliseconds = now.getTime() - lastCachedDate.getTime();
                const diffInMinutes = (Math.floor(diffInMilliseconds / (1000 * 60))) - 300; // The 300 is for time zone shit I guess
                if (diffInMinutes > VAR_MINUTES_TO_CAHCE_FEED) {
                    log("[CACHE] Cache is out of date, fetching updated newsfeed");
                    // Since we are asking for a UserFeed, we probably also want the actual
                    // feed itself
                    // Need to get the feed's URL here
                    // var url = 'http://feeds.feedwrench.com/JavaScriptJabber.rss';
                    const { url } = feedSource;
                    FeedHandler_1.default.parse(url)
                        .then(function (items) {
                        let feedItems = items.slice(0, 10);
                        let cachedNewsItems = new Array();
                        feedItems.map((item) => {
                            let shortCleanDesc = item.description
                                .replace(/<\/?[^>]+(>|$)/g, "")
                                .replace(/ *\([^)]*\) */g, "")
                                .replace(/\s\s+/g, ' ')
                                .substr(0, 240);
                            let cachedNewsItem = new models_1.CachedNewsItemModel(item.title, item.link, shortCleanDesc, feedSource.feedSourceID);
                            // log('title: ', item.title);
                            cachedNewsItems.push(cachedNewsItem);
                        });
                        // Remove cachedNewsItems from the database
                        cachedNewsItemModel.destroyByFeedSourceID(feedSource.feedSourceID)
                            .then(deleteReturn => {
                            // Save cachedNewsItems to the database
                            var insertPromises = cachedNewsItems.map(cni => {
                                return cachedNewsItemModel.create(cni)
                                    .then(cniReturn => {
                                    return "OK";
                                });
                            });
                            return Promise.all(insertPromises)
                                .then(() => {
                                // Update FeedSorce's LastCachedDate
                                // Get the UserFeed
                                // TODO: Repeated Code 
                                return modelDef.connectDB('SQUserFeed')
                                    .then(SQUserFeed => {
                                    return SQUserFeed['find']({ where: { feedSourceID, pageID } })
                                        .then(userFeed => {
                                        if (!userFeed) {
                                            // throw new Error("No userFeed found for " + userFeedID);
                                            return null;
                                        }
                                        else {
                                            let userFeedModel = new models_1.UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID, "#");
                                            return userFeedModel;
                                        }
                                    });
                                });
                            });
                        });
                    })
                        .catch(function (error) {
                        error('error: ', error);
                    });
                }
                else {
                    log("[CACHE] Cache is up to date, fetching from cache");
                    // Get the UserFeed
                    return modelDef.connectDB('SQUserFeed')
                        .then(SQUserFeed => {
                        return SQUserFeed['find']({ where: { feedSourceID, pageID } })
                            .then(userFeed => {
                            if (!userFeed) {
                                // throw new Error("No userFeed found for " + userFeedID);
                                return null;
                            }
                            else {
                                let userFeedModel = new models_1.UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID, "#");
                                return userFeedModel;
                            }
                        });
                    });
                }
            }
        });
    });
}
exports.read = read;
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
//# sourceMappingURL=userfeeds-sequelize.js.map