import { postsCollection } from '../db/db'
import { OutputPost } from '../models/posts/output/output'
import { UpdatePost } from '../models/posts/input/update'
import { postMapper } from '../models/posts/mappers/mapper'
import { ExtendedCreatePost } from '../models/posts/input/create'
import { ObjectId } from 'mongodb'

export class PostRepository {
  static async getAllPosts(): Promise<OutputPost[]> {
    const posts = await postsCollection.find({}).toArray()

    return posts.map(postMapper)
  }

  static async getPostById(id: string): Promise<OutputPost | null> {
    const post = await postsCollection.findOne({ _id: new ObjectId(id) })

    if (!post) {
      return null
    }

    return postMapper(post)
  }

  static async createPost(newPost: ExtendedCreatePost): Promise<string> {
    const { insertedId } = await postsCollection.insertOne(newPost)

    return insertedId.toString()
  }

  static async updatePost(id: string, updatedPostData: UpdatePost): Promise<boolean> {
    const result = await postsCollection.updateOne({ _id: new ObjectId(id) }, {
      $set: updatedPostData
    })

    return !!result.matchedCount
  }

  static async deletePost(id: string): Promise<boolean> {
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) })

    return !!result.deletedCount
  }
}