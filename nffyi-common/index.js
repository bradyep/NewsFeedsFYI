"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var models_1 = require("./models");
exports.CachedNewsItemModel = models_1.CachedNewsItemModel;
exports.UserFeedModel = models_1.UserFeedModel;
exports.PageModel = models_1.PageModel;
exports.LinkModel = models_1.LinkModel;
exports.UserModel = models_1.UserModel;
var constants_1 = require("./constants");
exports.Roles = constants_1.Roles;
exports.ROLE_DB_NAMES = constants_1.ROLE_DB_NAMES;
exports.MINUTES_TO_CAHCE_FEED = constants_1.MINUTES_TO_CAHCE_FEED;
exports.MAX_NEWS_ITEMS = constants_1.MAX_NEWS_ITEMS;
exports.NUMBER_OF_COLUMNS = constants_1.NUMBER_OF_COLUMNS;
function about() {
    return "Common Code for newsfeeds.fyi";
}
exports.about = about;
//# sourceMappingURL=index.js.map