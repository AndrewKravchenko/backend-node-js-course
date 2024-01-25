import { PaginatedData } from '../../common'

export type OutputBlogs = PaginatedData<OutputBlog>

export type OutputBlog = {
  id: string,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean,
}
