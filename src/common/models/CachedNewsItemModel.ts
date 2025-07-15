import * as logModule from 'debug';
const log = logModule('nffyi-common:CachedNewsItem');
// const error = logModule('nffyi-common:error');

export class CachedNewsItemModel {

  constructor(
    public title: string, 
    public link: string, 
    public description: string, 
    public feedSourceID?: number, // FK
    public cachedNewsItemID?: number,  // PK
    public feedSourceWebTitle?: string, 
    public feedSourceWebURL?: string
  ) { }

  // QUESTION: Do we need special JSON methods? I guess methods like these allow us to do more specific serialization.
  get JSON() {
    return JSON.stringify({
      cachedNewsItemID: this.cachedNewsItemID, feedSourceID: this.feedSourceID, title: this.title, link: this.link, description: this.description
    });
  }

  static fromJSON(json: string) {
    var data = JSON.parse(json);
    var cachedNewsItem = new CachedNewsItemModel(data.title, data.link, data.description, data.feedSourceID, data.cachedNewsItemID);
    log(json + ' => ' + cachedNewsItem);
    return cachedNewsItem;
  }
}; // /class CachedNewsItem

// QUESTION: Why do we need to export this again? Commenting out for now.
// ANSWER: This is needed if you forget to put curly braces when importing the class in other files.
// So remember to do that!
// export default CachedNewsItemModel;
