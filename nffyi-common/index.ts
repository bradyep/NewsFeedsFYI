// import { CachedNewsItemModel, UserFeedModel, PageModel, LinkModel, UserModel } from './models';
import * as models from './models';
// import { Roles, ROLE_DB_NAMES, MINUTES_TO_CAHCE_FEED, MAX_NEWS_ITEMS, NUMBER_OF_COLUMNS } from './constants';
import { roles, newsfeeds } from './constants';

let constants = {
  roles, newsfeeds
};

export function about() 
{
  return "Common Code for newsfeeds.fyi";
}

export { models, constants };
