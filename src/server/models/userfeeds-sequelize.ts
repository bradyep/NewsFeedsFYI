import debug = require('debug');
const log = debug('nffyi-rest:userFeeds-model');
const error = debug('nffyi-rest:error');
import FeedHandler from './FeedHandler';
import feedSourcesModel = require('server/models/feedsources-sequelize');
import cachedNewsItemModel = require('server/models/cached-newsitems-sequelize');
import { FeedSourceModel } from 'server/models/FeedSourceModel';
import modelDef = require('./nffyi-sequelize');
import { UserFeedModel, CachedNewsItemModel } from 'common/models';
import { MINUTES_TO_CACHE_FEED, MAX_NEWS_ITEMS } from 'common/constants/newsfeeds';

const VAR_MINUTES_TO_CACHE_FEED: number = MINUTES_TO_CACHE_FEED;
const VAR_MAX_NEWS_ITEMS: number = MAX_NEWS_ITEMS;

export function create(userFeed: UserFeedModel): Promise<UserFeedModel> {
  return modelDef.connectDB('SQUserFeed')
    .then((SQUserFeed: any) => {
      return SQUserFeed['create']({
        column: userFeed.column,
        row: userFeed.row,
        name: userFeed.name,
        itemDisplayCount: userFeed.itemDisplayCount,
        pageID: userFeed.pageID,
        feedSourceID: userFeed.feedSourceID
      });
    });
};

export function update(userFeed: UserFeedModel) {
  return modelDef.connectDB('SQUserFeed')
    .then((SQUserFeed: any) => {
      return SQUserFeed['findOne']({
        where: {
          userFeedID: userFeed.userFeedID
        }
      })
        .then((existingUserFeed: any) => {
          if (!existingUserFeed) {
            // throw new Error("No userFeed found for userFeedID " + userFeedID);
            return null;
          } else {
            return existingUserFeed.update({
              column: userFeed.column,
              row: userFeed.row,
              name: userFeed.name,
              itemDisplayCount: userFeed.itemDisplayCount,
              pageID: userFeed.pageID
            });
          }
        });
    });
};

export async function getUserFeedAsync(feedSourceID: number, pageID: number): Promise<UserFeedModel | undefined> {
  try {
    const SQUserFeedModel: any = await modelDef.connectDB('SQUserFeed');
    let dbUserFeedModel: UserFeedModel = await SQUserFeedModel['findOne']({ where: { feedSourceID, pageID } });
    if (!dbUserFeedModel) throw new Error("Cannot find UserFeed for supplied feedSourceID and pageID: " + feedSourceID + ", " + pageID);
    let userFeedModel = new UserFeedModel(dbUserFeedModel.column, dbUserFeedModel.row, dbUserFeedModel.name, dbUserFeedModel.itemDisplayCount, dbUserFeedModel.pageID, dbUserFeedModel.feedSourceID, "#");

    return userFeedModel;
  } catch (err) {
    error("Error Calling getUserFeedAsync: " + err);

    return undefined;
  }
}

export async function getNewsItemsFromFeedAsync(url: string, feedSourceID: number): Promise<CachedNewsItemModel[] | undefined> {
  try {
    const newsItems: any = await FeedHandler.parse(url);
    let feedItems = newsItems.slice(0, VAR_MAX_NEWS_ITEMS);
    let cachedNewsItems = new Array<CachedNewsItemModel>();

    feedItems.map((item: any) => {
      let shortCleanDesc = item.description ? item.description
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/ *\([^)]*\) */g, "")
        .replace(/\s\s+/g, ' ')
        .substr(0, 240)
        : 'Description was null'

      let cachedNewsItem = new CachedNewsItemModel(item.title, item.link, shortCleanDesc, feedSourceID, undefined, item.meta.title, item.meta.link);
      cachedNewsItems.push(cachedNewsItem);
    });

    return cachedNewsItems;

  } catch (err) {
    error("Error Calling getNewsItemsFromFeedAsync: " + err);

    return undefined;
  }
}

export async function updateCachedNewsItemsAsync(cachedNewsItems: CachedNewsItemModel[]): Promise<string[] | undefined> {
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

    return undefined;
  }
}

/** Determines whether a FeedSource's cache is up to date */
export async function updateFeedSourceCachedNewsItemsIfNeeded(feedSourceID: number): Promise<boolean> {
  const SQFeedSourceModel = await modelDef.connectDB('SQFeedSource') as any;
  let feedSourceModel: FeedSourceModel = await SQFeedSourceModel['findOne']({ where: { feedSourceID } });
  if (!feedSourceModel) error("Cannot find FeedSource for supplied feedSourceID: " + feedSourceID);

  const now = new Date();
  const { lastCachedDate } = feedSourceModel;
  const diffInMilliseconds = now.getTime() - lastCachedDate.getTime();
  const diffInMinutes = (Math.floor(diffInMilliseconds / (1000 * 60)));
  log('[Reading From FeedSourceID = ' + feedSourceID + '] The current time is: ' + now.toString() + '. The FeedSource was last cached at: ' + lastCachedDate.toString() + '. The difference in minutes is: ' + diffInMinutes);

  if (diffInMinutes > VAR_MINUTES_TO_CACHE_FEED) {
    log("[CACHE] diffInMinutes: " + diffInMinutes + ". VAR_MINUTES_TO_CACHE_FEED: " + VAR_MINUTES_TO_CACHE_FEED + ". Cache is out of date, fetching updated newsfeed");
    const newNewsItems: CachedNewsItemModel[] = await getNewsItemsFromFeedAsync(feedSourceModel.url, feedSourceID) ?? [];
    log('Got ' + newNewsItems.length + 'back from calling userfeeds-sequelize.getNewsItemsFromFeedAsync');
    const deleteOldCachedNewsItemsReturn: any = await cachedNewsItemModel.destroyByFeedSourceID(feedSourceID);
    log('Deleted ' + deleteOldCachedNewsItemsReturn.length + ' items from calling cachedNewsItemModel.destroyByFeedSourceID');
    const updateCachedNewsItemsReturn: string[] = await updateCachedNewsItemsAsync(newNewsItems) ?? [];
    log('Updated ' + updateCachedNewsItemsReturn.length + ' items from calling userfeeds-sequelize.updateCachedNewsItemsAsync');
    // Put together a real feedSourceModel and update its lastCachedDate
    let realFeedSourceModel: FeedSourceModel = new FeedSourceModel(feedSourceModel.url, feedSourceModel.cachedTitle, feedSourceModel.cachedWebsiteURL, new Date(), feedSourceModel.feedSourceID);
    const updateFeedSourceReturn: any = await feedSourcesModel.update(realFeedSourceModel);
    return true;
  } else {
    log("[CACHE] diffInMinutes: " + diffInMinutes + ". VAR_MINUTES_TO_CACHE_FEED: " + VAR_MINUTES_TO_CACHE_FEED + ". Cache is up to date, fetching from cache");
    return false;
  }
}

export async function readAsync(feedSourceID: number, pageID: number): Promise<UserFeedModel | undefined> {
  try {
    const cachedNewsItemsUpdated = await updateFeedSourceCachedNewsItemsIfNeeded(feedSourceID);
    log('Cached News Items Updated: ' + cachedNewsItemsUpdated.toString());

    const userFeedModel = await getUserFeedAsync(feedSourceID, pageID);
    return userFeedModel;
  } catch (err) {
    error("Error Calling readAsync: " + err);

    return undefined;
  }
}

export async function readByUserFeedIDAsync(userFeedID: number): Promise<UserFeedModel | undefined> {
  try {
    const SQUserFeedModel: any = await modelDef.connectDB('SQUserFeed');
    let dbUserFeedModel: any = await SQUserFeedModel['findOne']({ where: { userFeedID } });
    
    if (!dbUserFeedModel) {
      log('No UserFeedModel found for userFeedID: ' + userFeedID);
      return undefined;
    }

    // Update cached news items if needed
    const cachedNewsItemsUpdated = await updateFeedSourceCachedNewsItemsIfNeeded(dbUserFeedModel.feedSourceID);
    log('Cached News Items Updated: ' + cachedNewsItemsUpdated.toString());

    return new UserFeedModel(
      dbUserFeedModel.column,
      dbUserFeedModel.row,
      dbUserFeedModel.name,
      dbUserFeedModel.itemDisplayCount,
      dbUserFeedModel.pageID,
      dbUserFeedModel.feedSourceID,
      undefined, // titleURL
      undefined, // newsItems - to be populated later
      dbUserFeedModel.userFeedID
    );
  } catch (err) {
    error("Error Calling readByUserFeedIDAsync: " + err);
    return undefined;
  }
}

export function destroy(feedSourceID: number, pageID: number) {
  return modelDef.connectDB('SQUserFeed')
    .then((SQUserFeed: any) => {
      return SQUserFeed['findOne']({ where: { feedSourceID, pageID } })
        .then((userFeed: any) => {
          if (!userFeed) return null;
          else return userFeed.destroy();
        });
    });
};

export function destroyByUserFeedID(userFeedID: number) {
  return modelDef.connectDB('SQUserFeed')
    .then((SQUserFeed: any) => {
      return SQUserFeed['findOne']({ where: { userFeedID } })
        .then((userFeed: any) => {
          if (!userFeed) return null;
          else return userFeed.destroy();
        });
    });
};

export function getUserFeedsByPageID(pageID: number): Promise<any[]> {
  return modelDef.connectDB('SQUserFeed')
    .then((SQUserFeed: any) => {
      return SQUserFeed['findAll']({ where: { pageID } });
    });
};

/** Returns all feedSourceIDs for a given pageID */
export function keylist(pageID: number) {
  return modelDef.connectDB('SQUserFeed')
    .then((SQUserFeed: any) => {
      return SQUserFeed['findAll']({ where: { pageID }, attributes: ['feedSourceID'] })
        .then((userFeeds: any) => {
          return userFeeds.map((userFeed: any) => userFeed.feedSourceID);
        });
    });
};

export function count() {
  return modelDef.connectDB('SQUserFeed')
    .then((SQUserFeed: any) => {
      return SQUserFeed['count']()
        .then((count: any) => {
          log('COUNT ' + count);
          return count;
        });
    });
};
