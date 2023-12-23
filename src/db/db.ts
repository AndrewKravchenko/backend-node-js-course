import { BlogDB, DB, PostDB } from '../models/db/db'
import { MongoClient } from 'mongodb'

const port = process.env.PORT || 3000
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'

const client = new MongoClient(uri)
export const database = client.db(process.env.DB_NAME)

export const blogCollection = database.collection<BlogDB>('blogs')
export const postsCollection = database.collection<PostDB>('posts')

export const runDb = async () => {
  try {
    await client.connect()
    await database.command({ ping: 1 })
    console.log('Client connected to Db')
    console.log(`App start on port ${port}`)

  } catch (e) {
    console.log(e)
    await client.close()
  }
}
