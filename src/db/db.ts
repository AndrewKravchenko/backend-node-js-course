import { BlogDB, CommentDB, PostDB, SessionsDB, UserDB } from '../models/db/db'
import { Collection, Db, MongoClient } from 'mongodb'

const port = process.env.PORT || 3000
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'

class Database {
  private client: MongoClient
  private database: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.database = this.client.db(process.env.DB_NAME)
  }

  public getBlogCollection(): Collection<BlogDB> {
    return this.database.collection<BlogDB>('blogs')
  }

  public getPostCollection(): Collection<PostDB> {
    return this.database.collection<PostDB>('posts')
  }

  public getUserCollection(): Collection<UserDB> {
    return this.database.collection<UserDB>('users')
  }

  public getCommentCollection(): Collection<CommentDB> {
    return this.database.collection<CommentDB>('comments')
  }

  public getSessionsCollection(): Collection<SessionsDB> {
    return this.database.collection<SessionsDB>('sessions')
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect()
      await this.pingDatabase()
      console.log('Connected to MongoDB server')
      console.log(`App started on port ${port}`)
    } catch (error) {
      console.error('Connection to MongoDB server failed:', error)
      await this.close()
    }
  }

  public async pingDatabase(): Promise<void> {
    try {
      await this.database.command({ ping: 1 })
      console.log('MongoDB ping successful')
    } catch (error) {
      console.error('Error pinging the database:', error)
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client.close()
      console.log('Connection to MongoDB closed')
    } catch (error) {
      console.error('Error closing the MongoDB connection:', error)
    }
  }

  public async dropDatabase(): Promise<void> {
    try {
      // await this.database.dropDatabase();
      const collections = await this.database.listCollections().toArray()

      for (const collection of collections) {
        await this.database.collection(collection.name).deleteMany({})
      }
    } catch (error) {
      console.error('Error in dropping the database:', error)
      await this.close()
    }
  }
}

export const db = new Database()

export const blogCollection = db.getBlogCollection()
export const postCollection = db.getPostCollection()
export const userCollection = db.getUserCollection()
export const commentCollection = db.getCommentCollection()
export const sessionsCollection = db.getSessionsCollection()
