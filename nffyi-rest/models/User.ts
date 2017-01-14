import util = require('util');
import logModule = require('debug');
    const log = logModule('nffyi-rest:User');
import errorModule = require('debug');
    const error = errorModule('nffyi-rest:error');

// module.exports = class Note {
class User {
    userID: number;
    username: string;
    password: string;
    email: string;
    lastAccessDate: Date;
    role: string;

    constructor(username:string, password:string, email:string, role:string, userID?:number, lastAccessDate?:Date) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role
        this.userID = userID;
        this.lastAccessDate = lastAccessDate;
    }
    
    get JSON() {
        return JSON.stringify({
            userID: this.userID, userName: this.username, password: this.password, email: this.email, lastAccessDate: this.lastAccessDate, role: this.role
        });
    }
    
    static fromJSON(json) {
        var data = JSON.parse(json);
        var user = new User(data.userID, data.username, data.password, data.email, data.lastAccessDate, data.role);
        log(json +' => '+ util.inspect(user));
        return user;
    }
}; // /class User

export = User;
