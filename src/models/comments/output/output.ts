import { CommentatorInfo, LikeStatus } from '../../db/db'
import { PaginatedData } from '../../common'

export type OutputComments = PaginatedData<OutputComment>

export type OutputComment = {
  id: string,
  content: string,
  commentatorInfo: CommentatorInfo,
  likesInfo?: LikesInfoOutput,
  createdAt: string,
}

export type LikesInfoOutput = {
  myStatus: LikeStatus,
  likesCount: number,
  dislikesCount: number,
}
