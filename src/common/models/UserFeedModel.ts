import debug from 'debug';
const log = debug('common:UserFeed');
const error = debug('common:error');
import { observable } from 'mobx';
import { CachedNewsItemModel } from './';

export class UserFeedModel {
    readonly userFeedID?: number; // PK
    readonly feedSourceID?: number; // FK
    @observable public pageID?: number; // FK
    @observable public column: number;
    @observable public displayOrder: number;
    @observable public name: string;
    @observable public itemDisplayCount: number;
    
    @observable public titleURL: string;

    @observable
    public newsItems: Array<CachedNewsItemModel>;

    constructor(column: number, displayOrder: number, name: string, itemDisplayCount: number, pageID?: number, feedSourceID?: number, titleURL?: string, newsItems?: CachedNewsItemModel[], userFeedID?: number) {
        this.column = column;
        this.displayOrder = displayOrder;
        this.name = name;
        this.itemDisplayCount = itemDisplayCount;
        this.pageID = pageID;
        this.feedSourceID = feedSourceID;
        this.userFeedID = userFeedID;

        this.newsItems = newsItems || [];
        this.titleURL = titleURL || "";
    }
    
    get JSON() {
        return JSON.stringify({
            userFeedID: this.userFeedID, feedSourceID: this.feedSourceID, pageID: this.pageID, column: this.column, displayOrder: this.displayOrder, name: this.name, itemDisplayCount: this.itemDisplayCount, newsItems: this.newsItems
        });
    }
    
    static fromJSON(json:string) {
        var data = JSON.parse(json);
        var userFeed = new UserFeedModel(data.column, data.displayOrder, data.name, data.itemDisplayCount, data.pageID, data.feedSourceID, data.titleURL, data.newsItems, data.userFeedID);
        log(json + ' => ' + userFeed, null);
        return userFeed;
    }
}; // /class UserFeed

// TODO: It was a mistake to create this type, I should have just added feedSourceUrl and isEditing to UserFeedModel and use that directly. You could also make the argument that this should be a singleton as well.
/*** Used by the AddNewsFeedSection modal for both creating and editing user feeds */
export type EditableUserFeedModel = {
  userFeedID?: number;
  pageID?: number;
  name: string;
  itemDisplayCount: number;
  feedSourceUrl?: string;
  feedSourceID?: number;
  column?: number;
  displayOrder?: number;
  isEditing: boolean;
};
