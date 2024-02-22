import { postsModel } from '../db/db'
import { UpdatePost } from '../models/posts/input/update'
import { ExtendedCreatePost } from '../models/posts/input/create'
import { ObjectId } from 'mongodb'

export class PostsRepository {
  static async createPost(newPost: ExtendedCreatePost): Promise<string> {
    const { _id } = await postsModel.create(newPost)

    return _id.toString()
  }

  static async updatePost(id: string, updatedPost: UpdatePost): Promise<boolean> {
    const result = await postsModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedPost }
    )

    return !!result.matchedCount
  }

  static async deletePost(id: string): Promise<boolean> {
    const result = await postsModel.deleteOne({ _id: new ObjectId(id) })

    return !!result.deletedCount
  }
}