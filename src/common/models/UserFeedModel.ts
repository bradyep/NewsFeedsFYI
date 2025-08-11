import debug from 'debug';
const log = debug('common:UserFeed');
const error = debug('common:error');
import { observable } from 'mobx';
import { CachedNewsItemModel } from './';
import { NUMBER_OF_COLUMNS } from 'common/constants/newsfeeds';

interface ColumnDescriptor {
  columnNumber: number,
  userFeedCount: number
}

export class UserFeedModel {
    readonly userFeedID?: number; // PK
    readonly feedSourceID?: number; // FK
    @observable public pageID?: number; // FK
    @observable public column: number;
    @observable public row: number;
    @observable public name: string;
    @observable public itemDisplayCount: number;
    
    @observable public titleURL: string;

    @observable
    public newsItems: Array<CachedNewsItemModel>;

    constructor(column: number, row: number, name: string, itemDisplayCount: number, pageID?: number, feedSourceID?: number, titleURL?: string, newsItems?: CachedNewsItemModel[], userFeedID?: number) {
        this.column = column;
        this.row = row;
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
            userFeedID: this.userFeedID, feedSourceID: this.feedSourceID, pageID: this.pageID, column: this.column, row: this.row, name: this.name, itemDisplayCount: this.itemDisplayCount, newsItems: this.newsItems
        });
    }
    
    static fromJSON(json:string) {
        var data = JSON.parse(json);
        var userFeed = new UserFeedModel(data.column, data.row, data.name, data.itemDisplayCount, data.pageID, data.feedSourceID, data.titleURL, data.newsItems, data.userFeedID);
        log(json + ' => ' + userFeed, null);

        return userFeed;
    }

    /*** Returns the leftmost available column in the highest row (lowest row number) that has available columns space for a new or moved UserFeed */
    static getNextAvailableColumnAndRow(userFeeds: UserFeedModel[]): { column: number, row: number } {
          let columnDescriptors = new Array<ColumnDescriptor>();

          for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
            const currentColumnNumber: number = i + 1;
            const userFeedsInColumn = userFeeds.filter(uf => uf.column === currentColumnNumber);
            const numberOfUserFeedsInColumn = userFeedsInColumn ? userFeedsInColumn.length : 0;
            columnDescriptors.push({ columnNumber: currentColumnNumber, userFeedCount: numberOfUserFeedsInColumn });
          }
          if (columnDescriptors.length !== NUMBER_OF_COLUMNS) {
            error('ERROR: columnDescriptors.length = ' + columnDescriptors.length + ', NUMBER_OF_COLUMNS = ' + NUMBER_OF_COLUMNS + '. They should be the same.');
          }
          columnDescriptors.sort((a, b) => a.userFeedCount - b.userFeedCount);
          const columnID = columnDescriptors[0].columnNumber;
          const row = columnDescriptors[0].userFeedCount + 1;

          return { column: columnID, row: row };
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
  row?: number;
  isEditing: boolean;
};
