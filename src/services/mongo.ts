import { Collection, Document, MongoClient } from 'mongodb'
import { IMessage, Mode } from '../context/context.interface'

class Mongo {
    mongoClient: MongoClient
    users: Collection<Document>

    constructor(url: string) {
        this.mongoClient = new MongoClient(url)
        this.connect()
        this.createUsersCollection()
        this.users = this.mongoClient.db().collection('users')
    }

    async connect() {
        try {
            await this.mongoClient.connect()
        } catch (e) {
            console.log('Error while conection to MongoDB', e)
        }
    }

    async createUsersCollection() {
        const collections = await this.mongoClient.db().listCollections().toArray()
        const exists = collections.some((collection) => collection.name === 'users')

        if (!exists) {
            await this.mongoClient.db().createCollection('users')
        }
    }

    async addNewUser(first_name: string, id: number, mode: Mode) {
        const user = await this.getUser(id)

        if (!user) {
            await this.users.insertOne({ first_name, id, mode, messages: [] })
        }
    }

    async getMessages(id: number) {
        const user = await this.getUser(id)
        return user?.messages
    }

    async addNewMessage(id: number, message: IMessage) {
        await this.users.updateOne({ id }, { $push: { messages: message } })
    }

    async getMode(id: number) {
        const user = await this.getUser(id)
        return user?.mode as Mode
    }

    async setMode(id: number, mode: Mode, first_name: string) {
        const user = await this.getUser(id)

        console.log('mode:', mode)

        user
            ? await this.users.updateOne({ id }, { $set: { mode } })
            : await this.users.insertOne({ first_name, id, mode, messages: [] })
    }

    async getUser(id: number) {
        const user = await this.users.findOne({ id })
        return user
    }

    async deleteMessages(id: number) {
        const user = await this.getUser(id)
        if (!user) return
        await this.users.updateOne({ id }, { $set: { messages: [] } })
    }
}

export const mongoClient = new Mongo(
    'mongodb+srv://Den:l2wccRs5wwXd6aSh@cluster0.dc90oik.mongodb.net/'
)
