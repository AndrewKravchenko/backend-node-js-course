export type OutputUsers = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: ExtendedOutputUser[]
}

export type OutputUser = {
  id: string,
  login: string,
  email: string,
}

export type ExtendedOutputUser = {
  id: string,
  login: string,
  email: string,
  createdAt: string,
}
