import { likesModel } from '../db/db'
import { LikesDB, LikeStatus } from '../models/db/db'
import { CreateCommentLike, CreatePostLike } from '../models/likes/input/create'

export class LikesRepository {
  static async getPostNewestLikes(postId: string): Promise<LikesDB[] | null> {
    const likes = await likesModel.find({ postId, myStatus: LikeStatus.Like })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()

    if (!likes) {
      return null
    }

    return likes
  }

  static async createPostStatusLike(newLike: CreatePostLike): Promise<string> {
    const { _id } = await likesModel.create(newLike)

    return _id.toString()
  }

  static async createCommentStatusLike(newLike: CreateCommentLike): Promise<string> {
    const { _id } = await likesModel.create(newLike)

    return _id.toString()
  }

  static async updateCommentLikeStatus(commentId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const likeStatus = await likesModel.updateOne({ commentId, userId }, { myStatus })

    return !!likeStatus.matchedCount
  }

  static async updatePostLikeStatus(postId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const likeStatus = await likesModel.updateOne({ postId, userId }, { myStatus })

    return !!likeStatus.matchedCount
  }
}
