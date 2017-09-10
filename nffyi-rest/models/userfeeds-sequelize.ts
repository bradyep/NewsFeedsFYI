import logModule = require('debug');
  const log = logModule('nffyi-rest:userFeeds-model');
// import errorModule = require('debug');
  const error = logModule('nffyi-rest:error');
// import FeedHandler = require('./FeedHandler');
import FeedHandler from './FeedHandler';
import cachedNewsItemModel = require('../models/cached-newsitems-sequelize');
import FeedSourceModel from '../models/FeedSourceModel';
import modelDef = require('./nffyi-sequelize');
// import UserFeed = require('./UserFeed');
import { UserFeedModel, CachedNewsItemModel } from '../../nffyi-common/models';
import { MINUTES_TO_CAHCE_FEED, MAX_NEWS_ITEMS } from '../../nffyi-common/constants/newsfeeds';

var VAR_MINUTES_TO_CAHCE_FEED: number = MINUTES_TO_CAHCE_FEED;
var VAR_MAX_NEWS_ITEMS: number = MAX_NEWS_ITEMS;
// log(VAR_MINUTES_TO_CAHCE_FEED.toString());

export function create(userFeed:UserFeedModel) {
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
};

export function update(userFeed:UserFeedModel) {
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
            } else {
                return userFeed.updateAttributes({
                    column: userFeed.column,
                    displayOrder: userFeed.displayOrder,
                    name: userFeed.name,
                    itemDisplayCount: userFeed.itemDisplayCount
                });
            }
        });
    });
};

export function read(feedSourceID: number, pageID: number) {
    // First check to see if the FeedSource we are requesting needs to be updated
    return modelDef.connectDB('SQFeedSource')
    .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { feedSourceID } })
        .then((feedSource: FeedSourceModel) => {
            if (!feedSource) {
                // throw new Error("No feedSource found for " + feedSourceID);
                error("No feedSource found for: " + feedSourceID);
                return null;
            } else {
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
                    
                    FeedHandler.parse(url)
                    .then(function (items:Array<any>) {
                        let feedItems = items.slice(0, 10);
                        let cachedNewsItems = new Array<CachedNewsItemModel>();

                        feedItems.map((item: any) => {
                            let shortCleanDesc = item.description
                            .replace(/<\/?[^>]+(>|$)/g, "")
                            .replace(/ *\([^)]*\) */g, "")
                            .replace(/\s\s+/g, ' ')
                            .substr(0, 240);

                            let cachedNewsItem = new CachedNewsItemModel(item.title, item.link, shortCleanDesc, feedSource.feedSourceID);
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

                                // Get the UserFeed
                                // TODO: Repeated Code 
                                return modelDef.connectDB('SQUserFeed')
                                .then(SQUserFeed => {
                                    return SQUserFeed['find']({ where: { feedSourceID, pageID } })
                                    .then(userFeed => {
                                        if (!userFeed) {
                                            // throw new Error("No userFeed found for " + userFeedID);
                                            return null;
                                        } else {
                                            let userFeedModel = new UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID, "#");

                                            return userFeedModel;
                                        }
                                    });
                                });

                                    })
                                });

                    })
                    .catch(function (error) {
                        error('error: ', error);
                    });
                    
                } else {
                    log("[CACHE] Cache is up to date, fetching from cache");

                    // Get the UserFeed
                    return modelDef.connectDB('SQUserFeed')
                    .then(SQUserFeed => {
                        return SQUserFeed['find']({ where: { feedSourceID, pageID } })
                        .then(userFeed => {
                            if (!userFeed) {
                                // throw new Error("No userFeed found for " + userFeedID);
                                return null;
                            } else {
                                let userFeedModel = new UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID, "#");

                                return userFeedModel;
                            }
                        });
                    }); 

                }
            } 
        }) 
    });
} 

export function destroy(feedSourceID, pageID) {
    return modelDef.connectDB('SQUserFeed')
    .then(SQUserFeed => {
        return SQUserFeed['find']({ where: { feedSourceID, pageID } })
        .then(userFeed => {
            if (!userFeed) return null;
            else return userFeed.destroy();
        });
    });
};

export function keylist(pageID:number) {
    return modelDef.connectDB('SQUserFeed')
    .then(SQUserFeed => {
        return SQUserFeed['findAll']({ where: { pageID }, attributes: [ 'feedSourceID' ] })
        .then(userFeeds => {
            return userFeeds.map(userFeed => userFeed.feedSourceID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQUserFeed')
    .then(SQUserFeed => {
        return SQUserFeed['count']()
        .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};
