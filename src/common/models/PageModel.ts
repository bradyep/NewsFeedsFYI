import debug from 'debug';
const log = debug('common:Page');
const error = debug('common:error');
import { observable, action, makeObservable } from 'mobx';
import { UserFeedModel } from './';

export class PageModel {
    pageID: number | undefined; // PK
    userID: number; // FK
    public name: string;
    public displayOrder: number;
    public userFeeds: UserFeedModel[];

    constructor(name: string, displayOrder: number, userID: number, pageID?: number) {
        this.name = name;
        this.displayOrder = displayOrder;
        this.userID = userID;
        this.pageID = pageID;
        this.userFeeds = []; // Initialize empty array

        makeObservable(this, {
            name: observable,
            displayOrder: observable,
            userFeeds: observable,
            addUserFeed: action
        });
    }

    addUserFeed(userFeed: UserFeedModel): void {
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

// export default PageModel;
