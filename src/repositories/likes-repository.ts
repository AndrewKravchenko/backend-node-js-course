import { likesModel } from '../db/db'
import { LikeStatus } from '../models/db/db'
import { CreateLike } from '../models/likes/input/create'

export class LikesRepository {
  static async createCommentStatusLike(newLike: CreateLike): Promise<string> {
    const { _id } = await likesModel.create(newLike)

    return _id.toString()
  }


  static async updateLikeStatusByCommentId(commentId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const likeStatus = await likesModel.updateOne({ commentId, userId }, { myStatus })

    return !!likeStatus.matchedCount
  }
}
