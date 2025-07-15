import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:FeedSource');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

export class FeedSourceModel {

    constructor(
        public url: string, 
        public cachedTitle: string, 
        public cachedWebsiteURL: string, 
        public lastCachedDate: Date, 
        public feedSourceID?: number // PK
    ) { }
    
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, url: this.url, cachedTitle: this.cachedTitle, cachedWebsiteURL: this.cachedWebsiteURL, lastCachedDate: this.lastCachedDate
        });
    }
    
    static fromJSON(json: string) {
        var data = JSON.parse(json);
        var feedSource = new FeedSourceModel(data.url, data.cachedTitle, data.cachedWebsiteURL, data.lastCachedDate, data.feedSourceID);
        log(json +' => '+ util.inspect(feedSource));
        return feedSource;
    }
}; // /class FeedSource

// export default FeedSourceModel;
