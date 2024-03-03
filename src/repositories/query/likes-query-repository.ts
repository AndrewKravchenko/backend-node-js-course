import { likesModel } from '../../db/db'
import { LikeStatus } from '../../models/db/db'

export class LikesQueryRepository {
  static async getLikeStatusByCommentId(commentId: string, userId: string): Promise<null | LikeStatus> {
    const likeStatus = await likesModel.findOne({ commentId, userId })

    if (!likeStatus) {
      return null
    }

    return likeStatus.myStatus
  }
}
