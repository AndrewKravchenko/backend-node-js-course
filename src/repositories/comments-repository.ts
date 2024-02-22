import { commentsModel } from '../db/db'
import { ObjectId } from 'mongodb'
import { UpdateComment } from '../models/comments/input/update'
import { CreateComment } from '../models/comments/input/create'

export class CommentsRepository {
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

  static async deleteComment(commentId: string): Promise<boolean> {
    const result = await commentsModel.deleteOne({ _id: new ObjectId(commentId) })

    return !!result.deletedCount
  }
}