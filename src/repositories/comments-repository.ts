import { commentsModel } from '../db/db'
import { ObjectId } from 'mongodb'
import { UpdateComment } from '../models/comments/input/update'
import { CreateComment } from '../models/comments/input/create'
import { UpdateLikesCount } from '../models/likes/input/update'

export class CommentsRepository {
  static async isCommentExists(commentId: string): Promise<boolean> {
    return !!await commentsModel.findOne({ _id: new ObjectId(commentId) })
  }

  static async createCommentToPost(newComment: CreateComment): Promise<string> {
    const { _id } = await commentsModel.create(newComment)

    return _id.toString()
  }

  static async updateComment(commentId: string, updatedComment: UpdateComment): Promise<boolean> {
    const result = await commentsModel.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: updatedComment }
    )

    return !!result.matchedCount
  }

  static async updateLikesCount(commentId: string, likesCountUpdate: UpdateLikesCount): Promise<boolean> {
    let likesUpdate: Record<string, any> = {}

    if (likesCountUpdate.likesCount) {
      likesUpdate.$inc = { 'likesInfo.likesCount': likesCountUpdate.likesCount }
    }
    if (likesCountUpdate.dislikesCount) {
      likesUpdate.$inc = { ...likesUpdate.$inc, 'likesInfo.dislikesCount': likesCountUpdate.dislikesCount }
    }

    const result = await commentsModel.updateOne({ _id: new ObjectId(commentId) }, likesUpdate)

    return !!result.matchedCount
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    const result = await commentsModel.deleteOne({ _id: new ObjectId(commentId) })

    return !!result.deletedCount
  }
}