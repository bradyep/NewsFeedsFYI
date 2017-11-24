// import * as util from 'util';
import * as logModule from 'debug';
    const log = logModule('nffyi-common:Page');
// import errorModule = require('debug');
    const error = logModule('nffyi-common:error');
import { observable, action } from 'mobx';
import { UserFeedModel } from './';

// module.exports = class Note {
export class PageModel {
    // QUESTION: Why is this nullable? When would we ever have a PageModel without a pageID?
    pageID: number; // PK
    userID: number; // FK
    @observable public name: string;
    @observable public displayOrder: number;

    @observable public userFeeds: UserFeedModel[];

    constructor(name:string, displayOrder:number, userID:number, pageID:number) {
        this.name = name;
        this.displayOrder = displayOrder;
        this.userID = userID;
        this.pageID = pageID;
    }

    @action public addUserFeed(userFeed: UserFeedModel) {
      this.userFeeds.push(userFeed);
    }
    
    get JSON() {
        return JSON.stringify({
            pageID: this.pageID, userID: this.userID, name: this.name, displayOrder: this.displayOrder
        });
    }
    
    static fromJSON(json:string) {
        var data = JSON.parse(json);
        var page = new PageModel(data.name, data.displayOrder, data.userID, data.pageID);
        log(json +' => '+ page);
        return page;
    }
}; // /class Page

// export = Page;
export default PageModel;
