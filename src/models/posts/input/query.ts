import { PostDB } from '../../db/db'
import { Query } from '../../common'

export type QueryPost = Query<{ sortBy: PostSortOptions }>
export type PostSortOptions = keyof PostDB
