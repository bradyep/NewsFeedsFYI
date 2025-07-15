import logModule = require('debug');
  const log = logModule('nffyi-rest:feedSources-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');
import modelDef = require('./nffyi-sequelize');
import { FeedSourceModel } from './FeedSourceModel';

// TODO: See if the sequelize stuff can be typed instead of using 'any'

export function create(feedSource:FeedSourceModel): Promise<FeedSourceModel> {
    return modelDef.connectDB('SQFeedSource')
    .then((SQFeedSource: any) => {
        return SQFeedSource['create']({
            // feedSourceID: feedSource.feedSourceID, // Auto-Generated
            url: feedSource.url,
            cachedTitle: feedSource.cachedTitle,
            cachedWebsiteURL: feedSource.cachedWebsiteURL,
            lastCachedDate: feedSource.lastCachedDate
        });
    });
};

export function update(pFeedSource: FeedSourceModel) {
    return modelDef.connectDB('SQFeedSource')
    .then((SQFeedSource: any) => {
        return SQFeedSource['find']({ where: { feedSourceID: pFeedSource.feedSourceID } })
        .then((feedSource: any) => {
            if (!feedSource) {
                // throw new Error("No feedSource found for feedSourceID " + feedSourceID);
                return null;
            } else {
                return feedSource.updateAttributes({
                    url: pFeedSource.url,
                    cachedTitle: pFeedSource.cachedTitle,
                    cachedWebsiteURL: pFeedSource.cachedWebsiteURL,
                    lastCachedDate: pFeedSource.lastCachedDate
                });
            }
        });
    });
};

/** Returns FeedSourceModel from the database for a given ID */
export function read(feedSourceID: any): Promise<FeedSourceModel> {
    return modelDef.connectDB('SQFeedSource')
    .then((SQFeedSource: any) => {
        return SQFeedSource['find']({ where: { feedSourceID } })
        .then((feedSource: any) => {
            if (!feedSource) {
                // throw new Error("No feedSource found for " + feedSourceID);
                return null;
            } else {
                return new FeedSourceModel(feedSource.url, feedSource.cachedTitle, feedSource.cachedWebsiteURL, feedSource.lastCachedDate, feedSource.feedSourceID);
            }
        });
    });
};

export function getByURL(url: string):Promise<FeedSourceModel | undefined> {
  return modelDef.connectDB('SQFeedSource')
  .then((SQFeedSource: any) => {
      return SQFeedSource['find']({ where: { url } })
      .then((feedSource: any) => {
          if (!feedSource) {
              // throw new Error("No feedSource found for " + feedSourceID);
              return null;
          } else {
              return new FeedSourceModel(feedSource.url, feedSource.cachedTitle, feedSource.cachedWebsiteURL, feedSource.lastCachedDate, feedSource.feedSourceID);
          }
      });
  });
};

export function destroy(feedSourceID: any) {
    return modelDef.connectDB('SQFeedSource')
    .then((SQFeedSource: any) => {
        return SQFeedSource['find']({ where: { feedSourceID } })
        .then((feedSource: any) => {
            if (!feedSource) return null;
            else return feedSource.destroy();
        });
    });
};

export function keylist() {
    return modelDef.connectDB('SQFeedSource')
    .then((SQFeedSource: any) => {
        return SQFeedSource['findAll']({ attributes: [ 'feedSourceID' ] })
        .then((feedSources: any) => {
            return feedSources.map((feedSource: any) => feedSource.feedSourceID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQFeedSource')
    .then((SQFeedSource: any) => {
        return SQFeedSource['count']()
        .then((count: any) => {
            log('COUNT ' + count);
            return count;
        });
    });
};
