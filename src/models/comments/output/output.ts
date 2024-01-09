import { CommentatorInfo } from '../../db/db'

export type OutputComments = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: OutputComment[]
}

export type OutputComment = {
  id: string,
  content: string,
  commentatorInfo: CommentatorInfo,
  createdAt: string,
}
