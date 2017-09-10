import logModule = require('debug');
  const log = logModule('nffyi-rest:feedSources-model');
import errorModule = require('debug');
  const error = errorModule('nffyi-rest:error');

import modelDef = require('./nffyi-sequelize');
import FeedSourceModel from './FeedSourceModel';

export function create(feedSource:FeedSourceModel) {
    return modelDef.connectDB('SQFeedSource')
    .then(SQFeedSource => {
        return SQFeedSource['create']({
            // feedSourceID: feedSource.feedSourceID, // Auto-Generated
            url: feedSource.url,
            cachedTitle: feedSource.cachedTitle,
            cachedWebsiteURL: feedSource.cachedWebsiteURL,
            lastCachedDate: feedSource.lastCachedDate
        });
    });
};

export function update(feedSource:FeedSourceModel) {
    return modelDef.connectDB('SQFeedSource')
    .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { feedSourceID: feedSource.feedSourceID } })
        .then(feedSource => {
            if (!feedSource) {
                // throw new Error("No feedSource found for feedSourceID " + feedSourceID);
                return null;
            } else {
                return feedSource.updateAttributes({
                    url: feedSource.url,
                    cachedTitle: feedSource.cachedTitle,
                    cachedWebsiteURL: feedSource.cachedWebsiteURL,
                    lastCachedDate: feedSource.lastCachedDate
                });
            }
        });
    });
};

export function read(feedSourceID) {
    return modelDef.connectDB('SQFeedSource')
    .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { feedSourceID } })
        .then(feedSource => {
            if (!feedSource) {
                // throw new Error("No feedSource found for " + feedSourceID);
                return null;
            } else {
                return new FeedSourceModel(feedSource.url, feedSource.cachedTitle, feedSource.cachedWebsiteURL, feedSource.lastCachedDate, feedSource.feedSourceID);
            }
        });
    });
};

export function destroy(feedSourceID) {
    return modelDef.connectDB('SQFeedSource')
    .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { feedSourceID } })
        .then(feedSource => {
            if (!feedSource) return null;
            else return feedSource.destroy();
        });
    });
};

export function keylist() {
    return modelDef.connectDB('SQFeedSource')
    .then(SQFeedSource => {
        return SQFeedSource['findAll']({ attributes: [ 'feedSourceID' ] })
        .then(feedSources => {
            return feedSources.map(feedSource => feedSource.feedSourceID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQFeedSource')
    .then(SQFeedSource => {
        return SQFeedSource['count']()
        .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
};
