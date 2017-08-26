import * as util from 'util';
import * as logModule from 'debug';
    const log = logModule('nffyi-rest:UserFeed');
// import errorModule = require('debug');
    const error = logModule('nffyi-rest:error');
import { observable } from 'mobx';
import { CachedNewsItemModel } from './';

// module.exports = class Note {
export class UserFeedModel {
    readonly feedSourceID: number; // FK
    @observable public pageID: number; // FK
    @observable public column: number;
    @observable public displayOrder: number;
    @observable public name: string;
    @observable public itemDisplayCount: number;

    @observable public newsItems: CachedNewsItemModel[];

    constructor(column:number, displayOrder:number, name:string, itemDisplayCount:number, pageID?:number, feedSourceID?:number) {
        this.column = column;
        this.displayOrder = displayOrder;
        this.name = name;
        this.itemDisplayCount = itemDisplayCount;
        this.pageID = pageID;
        this.feedSourceID = feedSourceID;
    }
    
    get JSON() {
        return JSON.stringify({
            feedSourceID: this.feedSourceID, pageID: this.pageID, column: this.column, displayOrder: this.displayOrder, name: this.name, itemDisplayCount: this.itemDisplayCount
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var userFeed = new UserFeedModel(data.column, data.displayOrder, data.name, data.itemDisplayCount, data.pageID, data.feedSourceID);
        log(json + ' => ' + util.inspect(userFeed, null));
        return userFeed;
    }
}; // /class UserFeed

// export = UserFeed;
export default UserFeedModel;
