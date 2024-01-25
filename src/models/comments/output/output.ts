import { CommentatorInfo } from '../../db/db'
import { PaginatedData } from '../../common'

export type OutputComments = PaginatedData<OutputComment>

export type OutputComment = {
  id: string,
  content: string,
  commentatorInfo: CommentatorInfo,
  createdAt: string,
}
