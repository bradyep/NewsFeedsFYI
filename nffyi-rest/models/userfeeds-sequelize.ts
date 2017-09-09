import logModule = require('debug');
  const log = logModule('nffyi-rest:userFeeds-model');
// import errorModule = require('debug');
  const error = logModule('nffyi-rest:error');
// import FeedHandler = require('./FeedHandler');
import FeedHandler from './FeedHandler';
import cachedNewsItemModel = require('../models/cached-newsitems-sequelize');

import modelDef = require('./nffyi-sequelize');
// import UserFeed = require('./UserFeed');
import { UserFeedModel, CachedNewsItemModel } from '../../nffyi-common/models';

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

export function read(feedSourceID, pageID) {
    return modelDef.connectDB('SQUserFeed')
    .then(SQUserFeed => {
        return SQUserFeed['find']({ where: { feedSourceID, pageID } })
        .then(userFeed => {
            if (!userFeed) {
                // throw new Error("No userFeed found for " + userFeedID);
                return null;
            } else {
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

                let userFeedModel = new UserFeedModel(userFeed.column, userFeed.displayOrder, userFeed.name, userFeed.itemDisplayCount, userFeed.pageID, userFeed.feedSourceID, "#");

                return userFeedModel;
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
