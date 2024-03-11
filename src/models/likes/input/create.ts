import { LikeStatus } from '../../db/db'

export type CreateLikeReq = {
  likeStatus: LikeStatus,
}

export type CreateCommentLike = {
  userId: string
  commentId: string
  myStatus: LikeStatus
  createdAt: string,
}

export type CreatePostLike = {
  userId: string
  postId: string
  myStatus: LikeStatus
  createdAt: string,
}
