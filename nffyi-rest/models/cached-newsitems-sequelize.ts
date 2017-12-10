import logModule = require('debug');
  const log = logModule('nffyi-rest:cachedNewsItems-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');
import modelDef = require('./nffyi-sequelize');
// import CachedNewsItemModel = require('./CachedNewsItemModel');
// import { CachedNewsItemModel } from '../../nffyi-common/models';
// import { CachedNewsItemModel } from './common';
import { CachedNewsItemModel } from 'nffyi-common';
// var CachedNewsItemModel = models.CachedNewsItemModel;

export function create(cachedNewsItem:CachedNewsItemModel) {
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

export function update(cachedNewsItem:CachedNewsItemModel) {
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
                return new CachedNewsItemModel(cachedNewsItem.title, cachedNewsItem.link, cachedNewsItem.description, cachedNewsItem.feedSourceID, cachedNewsItem.cachedNewsItemID);
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

export function destroyByFeedSourceID(feedSourceID: number) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
      return SQCachedNewsItem['findAll']({ where: { feedSourceID }  })
      .then(cachedNewsItems => {
          return cachedNewsItems.map(cachedNewsItem => cachedNewsItem.destroy({ force: true }));
      });
    });
};

// Get Cached News Items By FeedSourceID
export function keylist(feedSourceID:number) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['findAll']({ where: { feedSourceID }, attributes: [ 'cachedNewsItemID' ] })
        .then(cachedNewsItems => {
            return cachedNewsItems.map(cachedNewsItem => cachedNewsItem.cachedNewsItemID);
        });
    });
};

export function getForFeedSourceID(feedSourceID:number) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['findAll']({ where: { feedSourceID }  })
        .then(cachedNewsItems => {
            return cachedNewsItems.map(cachedNewsItem => cachedNewsItem);
        });
    });
};

export function getKeysForMultipleFeedSourceID(feedSourceIDs:Array<number>) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then(SQCachedNewsItem => {
        return SQCachedNewsItem['findAll']({ where: 
            { feedSourceID: feedSourceIDs }, attributes: [ 'cachedNewsItemID' ] })
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
