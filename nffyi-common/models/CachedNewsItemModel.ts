// import * as util from 'util';
import * as logModule from 'debug';
    const log = logModule('nffyi-rest:CachedNewsItem');
// import * as errorModule from 'debug';
    const error = logModule('nffyi-rest:error');

export class CachedNewsItemModel {
    cachedNewsItemID?: number; // PK
    feedSourceID?: number; // FK
    title: string;
    link: string;
    description: string;
    feedSourceWebTitle?: string;
    feedSourceWebURL?: string;

    constructor(title: string, link: string, description: string, feedSourceID?: number, cachedNewsItemID?: number, feedSourceWebTitle?: string, feedSourceWebURL?: string) {
        this.title = title;
        this.link = link;
        this.description = description;
        this.feedSourceID = feedSourceID;
        this.cachedNewsItemID = cachedNewsItemID;
        this.feedSourceWebTitle = feedSourceWebTitle;
        this.feedSourceWebURL = feedSourceWebURL;
    }
    
    get JSON() {
        return JSON.stringify({
            cachedNewsItemID: this.cachedNewsItemID, feedSourceID: this.feedSourceID, title: this.title, link: this.link, description: this.description
        });
    }
    
    static fromJSON(json:string) {
        var data = JSON.parse(json);
        var cachedNewsItem = new CachedNewsItemModel(data.title, data.link, data.description, data.feedSourceID, data.cachedNewsItemID);
        // log(json +' => '+ util.inspect(cachedNewsItem));
        log(json +' => '+ cachedNewsItem);
        return cachedNewsItem;
    }
}; // /class CachedNewsItem

// export = CachedNewsItemModel;
export default CachedNewsItemModel;
