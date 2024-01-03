"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoClient = void 0;
const mongodb_1 = require("mongodb");
class Mongo {
    constructor(url) {
        this.mongoClient = new mongodb_1.MongoClient(url);
        this.connect();
        this.createUsersCollection();
        this.users = this.mongoClient.db().collection('users');
    }
    async connect() {
        try {
            await this.mongoClient.connect();
        }
        catch (e) {
            console.log('Error while conection to MongoDB', e);
        }
    }
    async createUsersCollection() {
        const collections = await this.mongoClient.db().listCollections().toArray();
        const exists = collections.some((collection) => collection.name === 'users');
        if (!exists) {
            await this.mongoClient.db().createCollection('users');
        }
    }
    async addNewUser(first_name, id, mode) {
        const user = await this.getUser(id);
        if (!user) {
            await this.users.insertOne({ first_name, id, mode, messages: [] });
        }
    }
    async getMessages(id) {
        const user = await this.getUser(id);
        return user?.messages;
    }
    async addNewMessage(id, message) {
        await this.users.updateOne({ id }, { $push: { messages: message } });
    }
    async getMode(id) {
        try {
            const user = await this.getUser(id);
            return user?.mode;
        }
        catch (e) {
            console.log('Error while getting mode', e);
        }
    }
    async setMode(id, mode, first_name) {
        const user = await this.getUser(id);
        user
            ? await this.users.updateOne({ id }, { $set: { mode } })
            : await this.users.insertOne({ first_name, id, mode, messages: [] });
    }
    async getUser(id) {
        const user = await this.users.findOne({ id });
        return user;
    }
    async deleteMessages(id) {
        try {
            const user = await this.getUser(id);
            if (!user)
                return;
            await this.users.updateOne({ id }, { $set: { messages: [] } });
            console.log('delete');
        }
        catch (e) {
            console.log('Error while deleting messages:', e);
        }
    }
}
exports.mongoClient = new Mongo('mongodb+srv://Den:l2wccRs5wwXd6aSh@cluster0.dc90oik.mongodb.net/');
