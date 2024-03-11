import { LikesQueryRepository } from '../repositories/query/likes-query-repository'
import { LikeStatus } from '../models/db/db'
import { LikesRepository } from '../repositories/likes-repository'
import { CreateCommentLike, CreatePostLike } from '../models/likes/input/create'
import { UpdateLikesCount } from '../models/likes/input/update'
import { LikeDetailsView } from '../models/likes/output/output'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'

export class LikesService {
  static async getLikeInfoByPostId(postId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    return await LikesQueryRepository.getPostLikeStatus(postId, userId)
  }

  static async getCommentLikeStatus(commentId: string, userId: string): Promise<LikeStatus | null> {
    return await LikesQueryRepository.getCommentLikeStatus(commentId, userId)
  }

  static async getPostNewestLikes(postId: string): Promise<LikeDetailsView[] | null> {
    const newestLikes = await LikesRepository.getPostNewestLikes(postId)

    if (!newestLikes) {
      return null
    }

    return Promise.all(newestLikes?.map(async (like) => {
      const user = await UsersQueryRepository.getUserById(like.userId)

      return {
        login: user!.login,
        userId: like.userId,
        addedAt: like.createdAt
      }
    }))
  }

  static async createPostLikeStatus(postId: string, userId: string, myStatus: LikeStatus): Promise<string> {
    const newLike: CreatePostLike = {
      postId,
      userId,
      myStatus,
      createdAt: new Date().toISOString(),
    }

    return await LikesRepository.createPostStatusLike(newLike)
  }

  static async createCommentLikeStatus(commentId: string, userId: string, myStatus: LikeStatus): Promise<string> {
    const newLike: CreateCommentLike = {
      commentId,
      userId,
      myStatus,
      createdAt: new Date().toISOString(),
    }

    return await LikesRepository.createCommentStatusLike(newLike)
  }

  static async updateCommentLikeStatus(commentId: string, userId: string, newLikeStatus: LikeStatus): Promise<boolean> {
    return await LikesRepository.updateCommentLikeStatus(commentId, userId, newLikeStatus)
  }

  static async updatePostLikeStatus(postId: string, userId: string, newLikeStatus: LikeStatus): Promise<boolean> {
    return await LikesRepository.updatePostLikeStatus(postId, userId, newLikeStatus)
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
