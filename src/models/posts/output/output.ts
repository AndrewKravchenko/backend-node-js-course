export type OutputPosts = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: OutputPost[]
}

export type OutputPost = {
  id: string,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string,
}
