import { PaginatedData } from '../../common'
import { ExtendedLikesInfo } from '../../likes/output/output'
import { LikesCountDB } from '../../db/db'

export type OutputPosts = PaginatedData<OutputPost>
export type OutputPostsDB = PaginatedData<OutputPostDB>

export type OutputPostDB = {
  id: string,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  extendedLikesInfo: LikesCountDB
  createdAt: string,
}

export type OutputPost = {
  id: string,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  extendedLikesInfo: ExtendedLikesInfo
  createdAt: string,
}
