import { CommentsRepository } from '../repositories/comments-repository'
import { UpdateComment } from '../models/comments/input/update'
import { CommentsQueryRepository } from '../repositories/query/comments-query-repository'
import { OutputComment } from '../models/comments/output/output'
import { LikeStatus } from '../models/db/db'
import { LikesService } from './likes-service'
import { UpdateLikesCount } from '../models/likes/input/update'
import { Result, ResultCode } from '../types/resultLayer'

export class CommentsService {
  static async getCommentById(commentId: string, userId?: string): Promise<OutputComment | null> {
    return await CommentsQueryRepository.getCommentById(commentId, userId)
  }

  static async isCommentExists(commentId: string): Promise<boolean> {
    return await CommentsRepository.isCommentExists(commentId)
  }

  static async updateComment(commentId: string, updatedComment: UpdateComment): Promise<boolean> {
    return await CommentsRepository.updateComment(commentId, updatedComment)
  }

  static async updateLikeStatus(userId: string, commentId: string, newLikeStatus: LikeStatus): Promise<Result> {
    const isCommentExists = await this.isCommentExists(commentId)

    if (!isCommentExists) {
      return { resultCode: ResultCode.NotFound }
    }

    const currentLikeStatus = await LikesService.getLikeStatusByCommentId(commentId, userId)

    if (currentLikeStatus === newLikeStatus) {
      return { resultCode: ResultCode.Success }
    }

    await this.updateLikesCount(commentId, currentLikeStatus || LikeStatus.None, newLikeStatus)

    if (currentLikeStatus) {
      await LikesService.updateCommentLikeStatus(commentId, userId, newLikeStatus)
    } else {
      await LikesService.createCommentLikeStatus(commentId, userId, newLikeStatus)
    }

    return { resultCode: ResultCode.Success }
  }

  static async updateLikesCount(commentId: string, currentLikeStatus: LikeStatus, newLikeStatus: LikeStatus): Promise<boolean> {
    const likesCountUpdate = this.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)

    return await CommentsRepository.updateLikesCount(commentId, likesCountUpdate)
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    return await CommentsRepository.deleteComment(commentId)
  }

  static calculateLikesCountChanges(currentLikeStatus: LikeStatus, newLikeStatus: LikeStatus): Record<string, number> {
    const likeCountUpdate: UpdateLikesCount = {}

    switch (`${currentLikeStatus}-${newLikeStatus}`) {
      case `${LikeStatus.None}-${LikeStatus.Like}`:
        likeCountUpdate.likesCount = 1
        break
      case `${LikeStatus.None}-${LikeStatus.Dislike}`:
        likeCountUpdate.dislikesCount = 1
        break
      case `${LikeStatus.Like}-${LikeStatus.Dislike}`:
        likeCountUpdate.likesCount = -1
        likeCountUpdate.dislikesCount = 1
        break
      case `${LikeStatus.Like}-${LikeStatus.None}`:
        likeCountUpdate.likesCount = -1
        break
      case `${LikeStatus.Dislike}-${LikeStatus.Like}`:
        likeCountUpdate.dislikesCount = -1
        likeCountUpdate.likesCount = 1
        break
      case `${LikeStatus.Dislike}-${LikeStatus.None}`:
        likeCountUpdate.dislikesCount = -1
        break
    }

    return likeCountUpdate
  }
}
