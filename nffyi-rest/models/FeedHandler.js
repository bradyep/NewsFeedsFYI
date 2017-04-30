"use strict";
// import request from 'request';
const request = require("request");
const FeedParser = require("feedparser");
class FeedHandler {
    // thing:string;
    // test () { return ""; }
    static parse(url) {
        return new Promise((resolve, reject) => {
            var items = [];
            const feedparser = new FeedParser();
            feedparser.on('error', (err) => {
                reject(err);
            });
            feedparser.on('readable', () => {
                let item;
                while (item = feedparser.read()) {
                    items.push(item);
                }
                return items;
            });
            request.get(url)
                .on('error', (err) => { reject(err); })
                .pipe(feedparser)
                .on('end', () => { return resolve(items); });
        }); // /return new Promise( (resolve, reject) => {
    } // static parse (options) {
} // /export default class FeedHandler
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeedHandler;
//# sourceMappingURL=FeedHandler.js.map