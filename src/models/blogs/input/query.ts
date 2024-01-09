export type QueryBlog = {
  searchNameTerm?: string,
  sortBy?: string,
  sortDirection?: 'asc' | 'desc',
  pageNumber?: string,
  pageSize?: string,
}

export type QueryPostByBlogId = {
  sortBy?: string,
  sortDirection?: 'asc' | 'desc',
  pageNumber?: string,
  pageSize?: string,
}
