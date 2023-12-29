export type OutputBlogs = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: OutputBlog[]
}

export type OutputBlog = {
  id: string,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean,
}
