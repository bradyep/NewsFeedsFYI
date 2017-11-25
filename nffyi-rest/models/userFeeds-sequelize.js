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
const error = logModule('nffyi-rest:error');
const FeedHandler_1 = require("./FeedHandler");
const feedSourcesModel = require("../models/feedsources-sequelize");
const cachedNewsItemModel = require("../models/cached-newsitems-sequelize");
const FeedSourceModel_1 = require("../models/FeedSourceModel");
const modelDef = require("./nffyi-sequelize");
const models_1 = require("../../nffyi-common/models");
const newsfeeds_1 = require("../../nffyi-common/constants/newsfeeds");
var VAR_MINUTES_TO_CAHCE_FEED = newsfeeds_1.MINUTES_TO_CAHCE_FEED;
var VAR_MAX_NEWS_ITEMS = newsfeeds_1.MAX_NEWS_ITEMS;
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
function getNewsItemsFromFeedAsync(url, feedSourceID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newsItems = yield FeedHandler_1.default.parse(url);
            let feedItems = newsItems.slice(0, VAR_MAX_NEWS_ITEMS);
            let cachedNewsItems = new Array();
            feedItems.map((item) => {
                let shortCleanDesc = item.description
                    .replace(/<\/?[^>]+(>|$)/g, "")
                    .replace(/ *\([^)]*\) */g, "")
                    .replace(/\s\s+/g, ' ')
                    .substr(0, 240);
                let cachedNewsItem = new models_1.CachedNewsItemModel(item.title, item.link, shortCleanDesc, feedSourceID, null, item.meta.title, item.meta.link);
                cachedNewsItems.push(cachedNewsItem);
            });
            return cachedNewsItems;
        }
        catch (err) {
            error("Error Calling getNewsItemsFromFeedAsync: " + err);
        }
    });
}
exports.getNewsItemsFromFeedAsync = getNewsItemsFromFeedAsync;
function updateCachedNewsItemsAsync(cachedNewsItems) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let insertPromises = cachedNewsItems.map(cni => {
                return cachedNewsItemModel.create(cni)
                    .then(cniReturn => {
                    return "OK";
                });
            });
            return Promise.all(insertPromises);
        }
        catch (err) {
            error("Error Calling updateCachedNewsItemsAsync: " + err);
        }
    });
}
exports.updateCachedNewsItemsAsync = updateCachedNewsItemsAsync;
function updateFeedSourceCachedNewsItemsIfNeeded(feedSourceID) {
    return __awaiter(this, void 0, void 0, function* () {
        // Determine whether FeedSource's cache is up to date
        const SQFeedSourceModel = yield modelDef.connectDB('SQFeedSource');
        let feedSourceModel = yield SQFeedSourceModel['find']({ where: { feedSourceID } });
        if (!feedSourceModel)
            error("Cannot find FeedSource for supplied feedSourceID: " + feedSourceID);
        const now = new Date();
        const { lastCachedDate } = feedSourceModel;
        const diffInMilliseconds = now.getTime() - lastCachedDate.getTime();
        const diffInMinutes = (Math.floor(diffInMilliseconds / (1000 * 60)));
        log('[Reading From FeedSourceID = ' + feedSourceID + '] The current time is: ' + now.toString() + '. The FeedSource was last cached at: ' + lastCachedDate.toString() + '. The difference in minutes is: ' + diffInMinutes);
        if (diffInMinutes > VAR_MINUTES_TO_CAHCE_FEED) {
            log("[CACHE] diffInMinutes: " + diffInMinutes + ". VAR_MINUTES_TO_CAHCE_FEED: " + VAR_MINUTES_TO_CAHCE_FEED + ". Cache is out of date, fetching updated newsfeed");
            const newNewsItems = yield getNewsItemsFromFeedAsync(feedSourceModel.url, feedSourceID);
            log('Got ' + newNewsItems.length + 'back from calling userfeeds-sequelize.getNewsItemsFromFeedAsync');
            const deleteOldCachedNewsItemsReturn = yield cachedNewsItemModel.destroyByFeedSourceID(feedSourceID);
            log('Deleted ' + deleteOldCachedNewsItemsReturn.length + ' items from calling cachedNewsItemModel.destroyByFeedSourceID');
            const updateCachedNewsItemsReturn = yield updateCachedNewsItemsAsync(newNewsItems);
            log('Updated ' + updateCachedNewsItemsReturn.length + ' items from calling userfeeds-sequelize.updateCachedNewsItemsAsync');
            // Put together a real feedSourceModel and update its lastCachedDate
            let realFeedSourceModel = new FeedSourceModel_1.default(feedSourceModel.url, feedSourceModel.cachedTitle, feedSourceModel.cachedWebsiteURL, new Date(), feedSourceModel.feedSourceID);
            const updateFeedSourceReturn = yield feedSourcesModel.update(realFeedSourceModel);
            return true;
        }
        else {
            log("[CACHE] diffInMinutes: " + diffInMinutes + ". VAR_MINUTES_TO_CAHCE_FEED: " + VAR_MINUTES_TO_CAHCE_FEED + ". Cache is up to date, fetching from cache");
            return false;
        }
    });
}
exports.updateFeedSourceCachedNewsItemsIfNeeded = updateFeedSourceCachedNewsItemsIfNeeded;
function readAsync(feedSourceID, pageID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cachedNewsItemsUpdated = updateFeedSourceCachedNewsItemsIfNeeded(feedSourceID);
            log('Cached News Items Updated: ' + cachedNewsItemsUpdated.toString());
            const userFeedModel = yield getUserFeedAsync(feedSourceID, pageID);
            return userFeedModel;
        }
        catch (err) {
            error("Error Calling readAsync: " + err);
        }
    });
}
exports.readAsync = readAsync;
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