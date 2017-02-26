import logModule = require('debug');
  const log = logModule('nffyi-rest:userFeeds-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');
// import FeedHandler = require('./FeedHandler');
import FeedHandler from './FeedHandler';

import modelDef = require('./nffyi-sequelize');
import UserFeed = require('./UserFeed');

export function create(userFeed:UserFeed) {
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

export function update(userFeed:UserFeed) {
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

export function read(feedSourceID, pageID) {
    return modelDef.connectDB('SQUserFeed')
    .then(SQUserFeed => {
        return SQUserFeed['find']({ where: { feedSourceID, pageID } })
        .then(userFeed => {
            if (!userFeed) {
                // throw new Error("No userFeed found for " + userFeedID);
                return null;
            } else {
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
                
                return new UserFeed(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID);
            }
        });
    });
};

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
