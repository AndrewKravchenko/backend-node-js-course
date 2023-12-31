export type QueryUser = {
  sortBy?: string,
  sortDirection?: 'asc' | 'desc',
  pageNumber?: string,
  pageSize?: string,
  searchLoginTerm?: string,
  searchEmailTerm?: string,
}
