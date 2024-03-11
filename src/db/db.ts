import { BlogDB, CommentDB, LikesDB, PostDB, RequestLogsDB, SessionsDB, UserDB } from '../models/db/db'
import { connect, model, Model, Mongoose } from 'mongoose'
import {
  blogSchema,
  commentSchema,
  likesSchema,
  postSchema,
  requestLogsSchema,
  sessionsSchema,
  userSchema
} from './schemata'

const port = process.env.PORT || 3000
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'

class Database {
  private blogsModel: Model<BlogDB>
  private postsModel: Model<PostDB>
  private usersModel: Model<UserDB>
  private commentsModel: Model<CommentDB>
  private sessionsModel: Model<SessionsDB>
  private requestLogsModel: Model<RequestLogsDB>
  private likesModel: Model<LikesDB>

  private mongoose: Mongoose | undefined

  constructor() {
    this.blogsModel = model('blogs', blogSchema)
    this.postsModel = model('posts', postSchema)
    this.usersModel = model('users', userSchema)
    this.commentsModel = model('comments', commentSchema)
    this.sessionsModel = model('sessions', sessionsSchema)
    this.requestLogsModel = model('requestLogs', requestLogsSchema)
    this.likesModel = model('likes', likesSchema)
  }

  public getBlogsModel(): Model<BlogDB> {
    return this.blogsModel
  }

  public getPostsModel(): Model<PostDB> {
    return this.postsModel
  }

  public getUsersModel(): Model<UserDB> {
    return this.usersModel
  }

  public getCommentsModel(): Model<CommentDB> {
    return this.commentsModel
  }

  public getSessionsModel(): Model<SessionsDB> {
    return this.sessionsModel
  }

  public getRequestLogsModel(): Model<RequestLogsDB> {
    return this.requestLogsModel
  }

  public getLikesModel(): Model<LikesDB> {
    return this.likesModel
  }

  public async connect(): Promise<void> {
    try {
      this.mongoose = await connect(uri)
      console.log('Connected to Mongoose')
      console.log(`App started on port ${port}`)
    } catch (error) {
      console.error('Connection to MongoDB server failed:', error)
      await this.close()
    }
  }

  public async close(): Promise<void> {
    try {
      await this.mongoose?.disconnect()
      console.log('Connection to Mongoose closed')
    } catch (error) {
      console.error('Error closing the MongoDB connection:', error)
    }
  }

  public async dropDatabase(): Promise<void> {
    try {
      // await this.database.dropDatabase();
      await this.blogsModel.deleteMany({})
      await this.postsModel.deleteMany({})
      await this.usersModel.deleteMany({})
      await this.commentsModel.deleteMany({})
      await this.sessionsModel.deleteMany({})
      await this.requestLogsModel.deleteMany({})
      await this.likesModel.deleteMany({})
    } catch (error) {
      console.error('Error in dropping the database:', error)
      await this.close()
    }
  }
}

export const db = new Database()

export const blogsModel = db.getBlogsModel()
export const postsModel = db.getPostsModel()
export const usersModel = db.getUsersModel()
export const commentsModel = db.getCommentsModel()
export const sessionsModel = db.getSessionsModel()
export const requestLogsModel = db.getRequestLogsModel()
export const likesModel = db.getLikesModel()
