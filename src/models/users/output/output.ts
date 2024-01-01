export type OutputUsers = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: OutputUser[]
}

export type OutputUser = {
  id: string,
  login: string,
  email: string,
  createdAt: string,
}
