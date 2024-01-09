import { CommentsRepository } from '../repositories/comments-repository'
import { UpdateComment } from '../models/comments/input/update'

export class CommentsService {
  static async updateComment(commentId: string, updatedComment: UpdateComment): Promise<boolean> {
    return await CommentsRepository.updateComment(commentId, updatedComment)
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    return await CommentsRepository.deleteComment(commentId)
  }
}
