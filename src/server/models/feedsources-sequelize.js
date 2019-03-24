"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logModule = require("debug");
const log = logModule('nffyi-rest:feedSources-model');
const errorModule = require("debug");
const error = errorModule('nffyi-rest:error');
const modelDef = require("./nffyi-sequelize");
const FeedSourceModel_1 = require("./FeedSourceModel");
function create(feedSource) {
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
}
exports.create = create;
;
function update(pFeedSource) {
    return modelDef.connectDB('SQFeedSource')
        .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { feedSourceID: pFeedSource.feedSourceID } })
            .then(feedSource => {
            if (!feedSource) {
                // throw new Error("No feedSource found for feedSourceID " + feedSourceID);
                return null;
            }
            else {
                return feedSource.updateAttributes({
                    url: pFeedSource.url,
                    cachedTitle: pFeedSource.cachedTitle,
                    cachedWebsiteURL: pFeedSource.cachedWebsiteURL,
                    lastCachedDate: pFeedSource.lastCachedDate
                });
            }
        });
    });
}
exports.update = update;
;
/** Returns FeedSourceModel from the database for a given ID */
function read(feedSourceID) {
    return modelDef.connectDB('SQFeedSource')
        .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { feedSourceID } })
            .then(feedSource => {
            if (!feedSource) {
                // throw new Error("No feedSource found for " + feedSourceID);
                return null;
            }
            else {
                return new FeedSourceModel_1.default(feedSource.url, feedSource.cachedTitle, feedSource.cachedWebsiteURL, feedSource.lastCachedDate, feedSource.feedSourceID);
            }
        });
    });
}
exports.read = read;
;
function getByURL(url) {
    return modelDef.connectDB('SQFeedSource')
        .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { url } })
            .then(feedSource => {
            if (!feedSource) {
                // throw new Error("No feedSource found for " + feedSourceID);
                return null;
            }
            else {
                return new FeedSourceModel_1.default(feedSource.url, feedSource.cachedTitle, feedSource.cachedWebsiteURL, feedSource.lastCachedDate, feedSource.feedSourceID);
            }
        });
    });
}
exports.getByURL = getByURL;
;
function destroy(feedSourceID) {
    return modelDef.connectDB('SQFeedSource')
        .then(SQFeedSource => {
        return SQFeedSource['find']({ where: { feedSourceID } })
            .then(feedSource => {
            if (!feedSource)
                return null;
            else
                return feedSource.destroy();
        });
    });
}
exports.destroy = destroy;
;
function keylist() {
    return modelDef.connectDB('SQFeedSource')
        .then(SQFeedSource => {
        return SQFeedSource['findAll']({ attributes: ['feedSourceID'] })
            .then(feedSources => {
            return feedSources.map(feedSource => feedSource.feedSourceID);
        });
    });
}
exports.keylist = keylist;
;
function count() {
    return modelDef.connectDB('SQFeedSource')
        .then(SQFeedSource => {
        return SQFeedSource['count']()
            .then(count => {
            log('COUNT ' + count);
            return count;
        });
    });
}
exports.count = count;
;
//# sourceMappingURL=feedsources-sequelize.js.map