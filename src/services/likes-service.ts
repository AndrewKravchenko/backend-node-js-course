import { LikesQueryRepository } from '../repositories/query/likes-query-repository'
import { LikeStatus } from '../models/db/db'
import { LikesRepository } from '../repositories/likes-repository'
import { CreateLike } from '../models/likes/input/create'

export class LikesService {
  static async getLikeStatusByCommentId(commentId: string, userId: string): Promise<null | LikeStatus> {
    return await LikesQueryRepository.getLikeStatusByCommentId(commentId, userId)
  }

  static async createCommentLikeStatus(commentId: string, userId: string, myStatus: LikeStatus): Promise<string> {
    const newLike: CreateLike = {
      commentId,
      userId,
      myStatus,
      createdAt: new Date().toISOString(),
    }

    return await LikesRepository.createCommentStatusLike(newLike)
  }

  static async updateCommentLikeStatus(commentId: string, userId: string, newLikeStatus: LikeStatus): Promise<boolean> {
    return await LikesRepository.updateLikeStatusByCommentId(commentId, userId, newLikeStatus)
  }
}
