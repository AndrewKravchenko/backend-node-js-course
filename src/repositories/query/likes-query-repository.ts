import { likesModel } from '../../db/db'
import { LikeStatus } from '../../models/db/db'

export class LikesQueryRepository {
  static async getPostLikeStatus(postId: string, userId: string): Promise<LikeStatus | null> {
    const likeStatus = await likesModel.findOne({ postId, userId }).lean()

    if (!likeStatus) {
      return null
    }

    return likeStatus.myStatus
  }

  static async getCommentLikeStatus(commentId: string, userId: string): Promise<LikeStatus | null> {
    const likeStatus = await likesModel.findOne({ commentId, userId }).lean()

    if (!likeStatus) {
      return null
    }

    return likeStatus.myStatus
  }
}
