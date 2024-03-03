import { LikeStatus } from '../../db/db'

export type CreateLikeReq = {
  likeStatus: LikeStatus,
}

export type CreateLike = {
  userId: string
  commentId: string
  myStatus: LikeStatus
  createdAt: string,
}
