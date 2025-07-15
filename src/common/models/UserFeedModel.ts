import * as logModule from 'debug';
const log = logModule('nffyi-common:UserFeed');
const error = logModule('nffyi-common:error');
import { observable } from 'mobx';
import { CachedNewsItemModel } from './';

export class UserFeedModel {
    readonly feedSourceID?: number; // FK
    @observable public pageID?: number; // FK
    @observable public column: number;
    @observable public displayOrder: number;
    @observable public name: string;
    @observable public itemDisplayCount: number;
    
    @observable public titleURL: string;

    @observable
    public newsItems: Array<CachedNewsItemModel>;

    // Cannot use the syntax below
    // @observable public newsItems: CachedNewsItemModel[];

    constructor(column: number, displayOrder: number, name: string, itemDisplayCount: number, pageID?: number, feedSourceID?: number, titleURL?: string, newsItems?: CachedNewsItemModel[]) {
        this.column = column;
        this.displayOrder = displayOrder;
        this.name = name;
        this.itemDisplayCount = itemDisplayCount;
        this.pageID = pageID;
        this.feedSourceID = feedSourceID;

        this.newsItems = newsItems || [];
        this.titleURL = titleURL || "";
    }
    
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, pageID: this.pageID, column: this.column, displayOrder: this.displayOrder, name: this.name, itemDisplayCount: this.itemDisplayCount, newsItems: this.newsItems
        });
    }
    
    static fromJSON(json:string) {
        var data = JSON.parse(json);
        var userFeed = new UserFeedModel(data.column, data.displayOrder, data.name, data.itemDisplayCount, data.pageID, data.feedSourceID, data.titleURL, data.newsItems);
        log(json + ' => ' + userFeed, null);
        return userFeed;
    }
}; // /class UserFeed

// export default UserFeedModel;
