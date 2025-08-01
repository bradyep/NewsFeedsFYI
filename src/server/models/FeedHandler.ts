// import request from 'request';
import * as request from 'request';
import FeedParser = require('feedparser');

export default class FeedHandler {
  static parse (url:string) {
    return new Promise((resolve, reject) => {
      var items:Array<any> = [];
      const feedparser = new FeedParser();

      feedparser.on('error', (err: any) => {
        reject(err);
      });

      feedparser.on('readable', () => {
        let item;
        while(item = feedparser.read()) { items.push(item); }
        return items;
      });

      request.get(url)
        .on('error', (err) => { reject(err); })
        .pipe(feedparser)
        .on('end', () => { return resolve(items); });
    }); // /return new Promise( (resolve, reject) => {
  } // static parse (options) {
} // /export default class FeedHandler
