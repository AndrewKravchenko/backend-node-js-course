import { CommentatorInfo } from '../../db/db'
import { PaginatedData } from '../../common'
import { LikesInfoOutput } from '../../likes/output/output'

export type OutputComments = PaginatedData<OutputComment>

export type OutputComment = {
  id: string,
  content: string,
  commentatorInfo: CommentatorInfo,
  likesInfo?: LikesInfoOutput,
  createdAt: string,
}
