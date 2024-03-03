import { CommentatorInfo } from '../../db/db'

export type CreateComment = {
  postId : string,
  content: string,
  likesInfo: LikesInfo,
  commentatorInfo: CommentatorInfo,
  createdAt: string,
}

type LikesInfo = {
  likesCount: number,
  dislikesCount: number,
}
