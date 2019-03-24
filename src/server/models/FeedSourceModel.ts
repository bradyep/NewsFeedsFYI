import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:FeedSource');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

// module.exports = class Note {
export class FeedSourceModel {
    feedSourceID: number; // PK
    url: string; 
    cachedTitle: string; 
    cachedWebsiteURL: string;
    lastCachedDate: Date;

    constructor(url:string, cachedTitle:string, cachedWebsiteURL:string, lastCachedDate:Date, feedSourceID?:number) {
        this.url = url;
        this.cachedTitle = cachedTitle;
        this.cachedWebsiteURL = cachedWebsiteURL;
        this.lastCachedDate = lastCachedDate;
        this.feedSourceID = feedSourceID;
    }
    
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, url: this.url, cachedTitle: this.cachedTitle, cachedWebsiteURL: this.cachedWebsiteURL, lastCachedDate: this.lastCachedDate
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var feedSource = new FeedSourceModel(data.url, data.cachedTitle, data.cachedWebsiteURL, data.lastCachedDate, data.feedSourceID);
        log(json +' => '+ util.inspect(feedSource));
        return feedSource;
    }
}; // /class FeedSource

export default FeedSourceModel;
