import { CachedNewsItemModel, UserFeedModel, PageModel, LinkModel, UserModel } from './models';
import { Roles, ROLE_DB_NAMES, MINUTES_TO_CAHCE_FEED, MAX_NEWS_ITEMS, NUMBER_OF_COLUMNS } from './constants';

export function about() 
{
  return "Common Code for newsfeeds.fyi";
}

export { CachedNewsItemModel, UserFeedModel, PageModel, LinkModel, UserModel, Roles, ROLE_DB_NAMES, MINUTES_TO_CAHCE_FEED, MAX_NEWS_ITEMS, NUMBER_OF_COLUMNS };
