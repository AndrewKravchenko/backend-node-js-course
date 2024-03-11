import { PostDB } from '../../db/db'
import { Query } from '../../common'

export type PostQuery = Query<{ sortBy: PostSortOptions }>
export type PostSortOptions = keyof PostDB
