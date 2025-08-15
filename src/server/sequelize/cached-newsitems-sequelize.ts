import logModule = require('debug');
  const log = logModule('nffyi-rest:cachedNewsItems-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');
import modelDef = require('./nffyi-sequelize');
import { CachedNewsItemModel } from 'common/models';

// TODO: Lots of 'any' types here. Find out if sequalize has types for these.

export function create(cachedNewsItem:CachedNewsItemModel) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
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
    .then((SQCachedNewsItem: any) => {
        return SQCachedNewsItem['findOne']({ where: { cachedNewsItemID: cachedNewsItem.cachedNewsItemID } })
        .then((cachedNewsItem: any) => {
            if (!cachedNewsItem) {
                // throw new Error("No cachedNewsItem found for cachedNewsItemID " + cachedNewsItemID);
                return null;
            } else {
                return cachedNewsItem.update({
                    feedSourceID: cachedNewsItem.feedSourceID,
                    title: cachedNewsItem.title,
                    link: cachedNewsItem.link,
                    description: cachedNewsItem.description
                });
            }
        });
    });
};

/** Returns the CachedNewsItemModel for a given key */
export function read(cachedNewsItemID: any): Promise<CachedNewsItemModel> {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
        return SQCachedNewsItem['findOne']({ where: { cachedNewsItemID } })
        .then((cachedNewsItem: any) => {
            if (!cachedNewsItem) {
                // throw new Error("No cachedNewsItem found for " + cachedNewsItemID);
                return null;
            } else {
                return new CachedNewsItemModel(cachedNewsItem.title, cachedNewsItem.link, cachedNewsItem.description, cachedNewsItem.feedSourceID, cachedNewsItem.cachedNewsItemID);
            }
        });
    });
};

export function destroy(cachedNewsItemID: any) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
        return SQCachedNewsItem['findOne']({ where: { cachedNewsItemID } })
        .then((cachedNewsItem: any) => {
            if (!cachedNewsItem) return null;
            else return cachedNewsItem.destroy();
        });
    });
};

export function destroyByFeedSourceID(feedSourceID: number) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
      return SQCachedNewsItem['findAll']({ where: { feedSourceID }  })
      .then((cachedNewsItems: any) => {
          return cachedNewsItems.map((cachedNewsItem: any) => cachedNewsItem.destroy({ force: true }));
      });
    });
};

// Get Cached News Items By FeedSourceID
export function keylist(feedSourceID:number) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
        return SQCachedNewsItem['findAll']({ where: { feedSourceID }, attributes: [ 'cachedNewsItemID' ] })
        .then((cachedNewsItems: any) => {
            return cachedNewsItems.map((cachedNewsItem: any) => cachedNewsItem.cachedNewsItemID);
        });
    });
};

export function getForFeedSourceID(feedSourceID:number) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
        return SQCachedNewsItem['findAll']({ where: { feedSourceID }  })
        .then((cachedNewsItems: any) => {
            return cachedNewsItems.map((cachedNewsItem: any) => cachedNewsItem);
        });
    });
};

export function getKeysForMultipleFeedSourceID(feedSourceIDs:Array<number>) {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
        return SQCachedNewsItem['findAll']({ where: 
            { feedSourceID: feedSourceIDs }, attributes: [ 'cachedNewsItemID' ] })
        .then((cachedNewsItems: any) => {
            return cachedNewsItems.map((cachedNewsItem: any) => cachedNewsItem.cachedNewsItemID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQCachedNewsItem')
    .then((SQCachedNewsItem: any) => {
        return SQCachedNewsItem['count']()
        .then((count: any) => {
            log('COUNT ' + count);
            return count;
        });
    });
};
