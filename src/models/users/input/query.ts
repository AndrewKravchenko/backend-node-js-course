import { Query } from '../../common'
import { UserDB } from '../../db/db'

export type QueryUser = Query<{
  sortBy: UsersSortOptions,
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
}>
export type UsersSortOptions = keyof Omit<UserDB, 'password' | 'passwordSalt'>
