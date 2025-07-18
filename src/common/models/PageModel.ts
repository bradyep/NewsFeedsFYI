import debug from 'debug';
const log = debug('common:Page');
const error = debug('common:error');
import { observable, action } from 'mobx';
import { UserFeedModel } from './';

export class PageModel {
    pageID: number | undefined; // PK
    userID: number; // FK
    @observable public name: string;
    @observable public displayOrder: number;
    @observable public userFeeds: UserFeedModel[];

    test() {
      console.log('hey!');
    }

    constructor(name: string, displayOrder: number, userID: number, pageID?: number) {
        this.name = name;
        this.displayOrder = displayOrder;
        this.userID = userID;
        this.pageID = pageID;
    }

    @action
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
