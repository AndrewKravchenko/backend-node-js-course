import { PaginatedData } from '../../common'

export type OutputPosts = PaginatedData<OutputPost>

export type OutputPost = {
  id: string,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string,
}
