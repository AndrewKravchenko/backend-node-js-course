import { CommentatorInfo, LikesCountDB } from '../../db/db'

export type CreateComment = {
  postId : string,
  content: string,
  likesInfo: LikesCountDB,
  commentatorInfo: CommentatorInfo,
  createdAt: string,
}
