import { EmailConfirmation } from '../input/create'

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

export type ExtendedOutputUser = {
  id: string,
  login: string,
  email: string,
  createdAt: string,
  emailConfirmation: EmailConfirmation
}
