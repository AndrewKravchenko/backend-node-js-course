import { LikeStatus } from '../../db/db'

export type ExtendedLikeOutput = {
  myStatus: LikeStatus,
}

export type LikeDetailsView = {
  userId: string
  login: string
  addedAt: string
}

export type LikesInfoOutput = {
  myStatus: LikeStatus,
  likesCount: number,
  dislikesCount: number,
}

export type ExtendedLikesInfo = LikesInfoOutput & {
  newestLikes: LikeDetailsView[] | null
}
