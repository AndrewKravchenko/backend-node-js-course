import { Query } from '../../common'
import { UserDB } from '../../db/db'

export type QueryUser = Query<{
  sortBy: keyof Omit<UserDB, 'password' | 'passwordSalt'>,
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
}>
