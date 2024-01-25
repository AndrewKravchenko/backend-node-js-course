import { CommentsRepository } from '../repositories/comments-repository'
import { UpdateComment } from '../models/comments/input/update'
import { CommentsQueryRepository } from '../repositories/query/comments-query-repository'
import { OutputComment } from '../models/comments/output/output'
import { ObjectId } from 'mongodb'

export class CommentsService {
  static async getCommentById(commentId: string): Promise<OutputComment | null> {
    if (!ObjectId.isValid(commentId)) {
      return null
    }

    return await CommentsQueryRepository.getCommentById(commentId)
  }

  static async updateComment(commentId: string, updatedComment: UpdateComment): Promise<boolean> {
    return await CommentsRepository.updateComment(commentId, updatedComment)
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    return await CommentsRepository.deleteComment(commentId)
  }
}
