import logModule = require('debug');
const log = logModule('nffyi-rest:userFeeds-model');
const error = logModule('nffyi-rest:error');
import FeedHandler from './FeedHandler';
import feedSourcesModel = require('../models/feedsources-sequelize');
import cachedNewsItemModel = require('../models/cached-newsitems-sequelize');
import FeedSourceModel from '../models/FeedSourceModel';
import modelDef = require('./nffyi-sequelize');
import { UserFeedModel, CachedNewsItemModel } from '../../nffyi-common/models';
import { MINUTES_TO_CAHCE_FEED, MAX_NEWS_ITEMS } from '../../nffyi-common/constants/newsfeeds';

var VAR_MINUTES_TO_CAHCE_FEED: number = MINUTES_TO_CAHCE_FEED;
var VAR_MAX_NEWS_ITEMS: number = MAX_NEWS_ITEMS;

export function create(userFeed: UserFeedModel): Promise<UserFeedModel> {
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

export function update(userFeed: UserFeedModel) {
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

export async function getUserFeedAsync(feedSourceID: number, pageID: number): Promise<UserFeedModel> {
  try {
    const SQUserFeedModel = await modelDef.connectDB('SQUserFeed');
    let dbUserFeedModel: UserFeedModel = await SQUserFeedModel['find']({ where: { feedSourceID, pageID } });
    if (!dbUserFeedModel) throw new Error("Cannot find UserFeed for supplied feedSourceID and pageID: " + feedSourceID + ", " + pageID);
    let userFeedModel = new UserFeedModel(dbUserFeedModel.column, dbUserFeedModel.displayOrder, dbUserFeedModel.name, dbUserFeedModel.itemDisplayCount, dbUserFeedModel.pageID, dbUserFeedModel.feedSourceID, "#");

    return userFeedModel;
  } catch (err) {
    error("Error Calling getUserFeedAsync: " + err);
  }
}

export async function getNewsItemsFromFeedAsync(url: string, feedSourceID: number): Promise<CachedNewsItemModel[]> {
  try {
    const newsItems: any = await FeedHandler.parse(url);
    let feedItems = newsItems.slice(0, VAR_MAX_NEWS_ITEMS);
    let cachedNewsItems = new Array<CachedNewsItemModel>();

    feedItems.map((item: any) => {
      let shortCleanDesc = item.description
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/ *\([^)]*\) */g, "")
        .replace(/\s\s+/g, ' ')
        .substr(0, 240);

      let cachedNewsItem = new CachedNewsItemModel(item.title, item.link, shortCleanDesc, feedSourceID, null, item.meta.title, item.meta.link);
      cachedNewsItems.push(cachedNewsItem);
    });

    return cachedNewsItems;

  } catch (err) {
    error("Error Calling getNewsItemsFromFeedAsync: " + err);
  }
}

export async function updateCachedNewsItemsAsync(cachedNewsItems: CachedNewsItemModel[]): Promise<string[]> {
  try {
    let insertPromises = cachedNewsItems.map(cni => {
      return cachedNewsItemModel.create(cni)
        .then(cniReturn => {
          return "OK";
        });
    });

    return Promise.all(insertPromises);
  } catch (err) {
    error("Error Calling updateCachedNewsItemsAsync: " + err);
  }
}

export async function updateFeedSourceCachedNewsItemsIfNeeded(feedSourceID: number): Promise<boolean> {
    // Determine whether FeedSource's cache is up to date
    const SQFeedSourceModel = await modelDef.connectDB('SQFeedSource');
    let feedSourceModel: FeedSourceModel = await SQFeedSourceModel['find']({ where: { feedSourceID } });
    if (!feedSourceModel) error("Cannot find FeedSource for supplied feedSourceID: " + feedSourceID);

    const now = new Date();
    const { lastCachedDate } = feedSourceModel;
    const diffInMilliseconds = now.getTime() - lastCachedDate.getTime();
    const diffInMinutes = (Math.floor(diffInMilliseconds / (1000 * 60)));
    log('[Reading From FeedSourceID = ' + feedSourceID + '] The current time is: ' + now.toString() + '. The FeedSource was last cached at: ' + lastCachedDate.toString() + '. The difference in minutes is: ' + diffInMinutes);

    if (diffInMinutes > VAR_MINUTES_TO_CAHCE_FEED) {
      log("[CACHE] diffInMinutes: " + diffInMinutes + ". VAR_MINUTES_TO_CAHCE_FEED: " + VAR_MINUTES_TO_CAHCE_FEED + ". Cache is out of date, fetching updated newsfeed");
      const newNewsItems: CachedNewsItemModel[] = await getNewsItemsFromFeedAsync(feedSourceModel.url, feedSourceID);
      log('Got ' + newNewsItems.length + 'back from calling userfeeds-sequelize.getNewsItemsFromFeedAsync');
      const deleteOldCachedNewsItemsReturn: any = await cachedNewsItemModel.destroyByFeedSourceID(feedSourceID);
      log('Deleted ' + deleteOldCachedNewsItemsReturn.length + ' items from calling cachedNewsItemModel.destroyByFeedSourceID');
      const updateCachedNewsItemsReturn: string[] = await updateCachedNewsItemsAsync(newNewsItems);
      log('Updated ' + updateCachedNewsItemsReturn.length + ' items from calling userfeeds-sequelize.updateCachedNewsItemsAsync');
      // Put together a real feedSourceModel and update its lastCachedDate
      let realFeedSourceModel: FeedSourceModel = new FeedSourceModel(feedSourceModel.url, feedSourceModel.cachedTitle, feedSourceModel.cachedWebsiteURL, new Date(), feedSourceModel.feedSourceID);
      const updateFeedSourceReturn: any = await feedSourcesModel.update(realFeedSourceModel);
      return true;
    } else {
      log("[CACHE] diffInMinutes: " + diffInMinutes + ". VAR_MINUTES_TO_CAHCE_FEED: " + VAR_MINUTES_TO_CAHCE_FEED + ". Cache is up to date, fetching from cache");
      return false;
    }
}

export async function readAsync(feedSourceID: number, pageID: number): Promise<UserFeedModel> {
  try {
    const cachedNewsItemsUpdated = updateFeedSourceCachedNewsItemsIfNeeded(feedSourceID);
    log('Cached News Items Updated: ' + cachedNewsItemsUpdated.toString());

    const userFeedModel = await getUserFeedAsync(feedSourceID, pageID);
    return userFeedModel;
  } catch (err) {
    error("Error Calling readAsync: " + err);
  }
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

export function keylist(pageID: number) {
  return modelDef.connectDB('SQUserFeed')
    .then(SQUserFeed => {
      return SQUserFeed['findAll']({ where: { pageID }, attributes: ['feedSourceID'] })
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
