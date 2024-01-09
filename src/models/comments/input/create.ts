import { CommentatorInfo } from '../../db/db'

export type CreateComment = {
  postId : string,
  content: string,
  commentatorInfo: CommentatorInfo,
  createdAt: string,
}
