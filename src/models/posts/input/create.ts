import { LikesCountDB } from '../../db/db'

export type CreatePost = {
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  extendedLikesInfo: LikesCountDB
}

export type ExtendedCreatePost = CreatePost & {
  blogName: string,
  createdAt: string,
}

export type CreateCommentToPost = {
  content: string,
}
