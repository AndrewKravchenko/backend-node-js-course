import { CommentDB } from '../../db/db'
import { Query } from '../../common'

export type QueryComment = Query<{ sortBy: CommentsSortOptions }>
export type CommentsSortOptions = keyof Omit<CommentDB, 'commentatorInfo' | 'postId'>

