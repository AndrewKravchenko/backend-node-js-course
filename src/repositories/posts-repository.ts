import { postsModel } from '../db/db'
import { UpdatePost } from '../models/posts/input/update'
import { ExtendedCreatePost } from '../models/posts/input/create'
import { ObjectId } from 'mongodb'
import { UpdateLikesCount } from '../models/likes/input/update'

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

  static async updateLikesCount(postId: string, likesCountUpdate: UpdateLikesCount): Promise<boolean> {
    let likesUpdate: Record<string, any> = {}

    if (likesCountUpdate.likesCount) {
      likesUpdate.$inc = { 'extendedLikesInfo.likesCount': likesCountUpdate.likesCount }
    }
    if (likesCountUpdate.dislikesCount) {
      likesUpdate.$inc = { ...likesUpdate.$inc, 'extendedLikesInfo.dislikesCount': likesCountUpdate.dislikesCount }
    }

    const result = await postsModel.updateOne({ _id: new ObjectId(postId) }, likesUpdate)

    return !!result.matchedCount
  }

  static async deletePost(id: string): Promise<boolean> {
    const result = await postsModel.deleteOne({ _id: new ObjectId(id) })

    return !!result.deletedCount
  }
}