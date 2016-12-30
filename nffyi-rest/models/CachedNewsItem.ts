import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:CachedNewsItem');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

// module.exports = class Note {
export class CachedNewsItem {
    feedSourceID: number;
    title: string;
    link: string;
    summary: string;

    constructor(feedSourceID, title, link, summary) {
        this.feedSourceID = feedSourceID;
        this.title = title;
        this.link = link;
        this.summary = summary;
    }
    
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, title: this.title, link: this.link, summary: this.summary
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var cachedNewsItem = new CachedNewsItem(data.feedSourceID, data.title, data.link, data.summary);
        log(json +' => '+ util.inspect(cachedNewsItem));
        return cachedNewsItem;
    }
}; // /class CachedNewsItem
