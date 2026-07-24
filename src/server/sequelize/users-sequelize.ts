import bcrypt = require('bcryptjs');
import debug = require('debug');
const log = debug('nffyi-rest:users-model');
const error = debug('nffyi-rest:error');
import modelDef = require('./nffyi-sequelize');
import { UserModel } from 'common/models';
import { BCRYPT_SALT_ROUNDS } from 'server/constants/auth-config';

export async function create(user: UserModel) {
    const SQUser: any = await modelDef.connectDB('SQUser');
    const hashedPassword = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
    return SQUser['create']({
        username: user.username,
        password: hashedPassword,
        email: user.email,
        lastAccessDate: Date(),
        roleID: user.roleID
    });
};

export async function update(userID: number, username: string, password: string, email: string) {
    const SQUser: any = await modelDef.connectDB('SQUser');
    const user = await SQUser['findOne']({ where: { userID } });
    if (!user) {
        // throw new Error("No User found for userID " + userID);
        return null;
    }
    const updates: any = { username, email, lastAccessDate: Date() };
    // Only overwrite the stored hash if a new password was actually supplied -
    // profile edits that don't touch the password shouldn't clobber the existing hash.
    if (password) {
        updates.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }
    return user.update(updates);
};

/** Get one User from the Database */
export function read(userID: number) {
    return modelDef.connectDB('SQUser')
    .then((SQUser: any) => {
        return SQUser['findOne']({ where: { userID } })
        .then((user: any) => {
            if (!user) {
                // throw new Error("No user found for " + userID);
                return null;
            } else {
                return new UserModel(user.username, user.password, user.email, user.roleID, user.userID, user.lastAccessDate);
                // return new User(7, 'steve', 'go4it', 'steve@steve.com', Date());
                // var test = new User();
/*
            return {
                userID: user.userID, 
                userName: user.userName, 
                password: user.password, 
                email: user.email, 
                lastAccessDate: user.lastAccessDate
            };
            */
            }
        });
    });
};

export function destroy(userID: number) {
    return modelDef.connectDB('SQUser')
    .then((SQUser: any) => {
        return SQUser['findOne']({ where: { userID } })
        .then((user: any) => {
            if (!user) return null;
            else return user.destroy();
        });
    });
};

export function keylist() {
    return modelDef.connectDB('SQUser')
    .then((SQUser: any) => {
        return SQUser['findAll']({ attributes: [ 'userID' ] })
        .then((users: any) => {
            return users.map((user: any) => user.userID);
        });
    });
};

export function count() {
    return modelDef.connectDB('SQUser')
    .then((SQUser: any) => {
        return SQUser['count']()
        .then((count: any) => {
            log('COUNT ' + count);
            return count;
        });
    });
};

/** Check if supplied credentials are valid */
export async function userPasswordCheck(username: string, password: string) {
    const SQUser: any = await modelDef.connectDB('SQUser');
    const user = await SQUser['findOne']({ where: { username } });
    if (!user) {
        return { check: false, userid: 0, username, message: "Could not find user" };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (user.username === username && isMatch) {
        return { check: true, userid: user.userID, username: user.username, roleid: user.roleID };
    }
    return { check: false, userid: 0, username: username, message: "Incorrect password" };
};
