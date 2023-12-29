export type QueryBlog = {
  searchNameTerm?: string,
  sortBy?: string,
  sortDirection?: 'asc' | 'desc',
  pageNumber?: string,
  pageSize?: string,
}

export type QueryPostByBlogID = {
  sortBy?: string,
  sortDirection?: 'asc' | 'desc',
  pageNumber?: string,
  pageSize?: string,
}
