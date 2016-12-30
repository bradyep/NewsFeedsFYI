import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:User');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

// module.exports = class Note {
class User {
    userID: number;
    userName: string;
    password: string;
    email: string;
    lastAccessDate: Date;

    constructor(userID, userName, password, email, lastAccessDate) {
        this.userID = userID;
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.lastAccessDate = lastAccessDate;
    }
    
    get JSON() {
        return JSON.stringify({
            userID: this.userID, userName: this.userName, password: this.password, email: this.email, lastAccessDate: this.lastAccessDate
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var user = new User(data.userID, data.userName, data.password, data.email, data.lastAccessDate);
        log(json +' => '+ util.inspect(user));
        return user;
    }
}; // /class User

export = User;
