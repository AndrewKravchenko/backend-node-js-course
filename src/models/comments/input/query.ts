import { CommentDB } from '../../db/db'
import { Query } from '../../common'

export type QueryComment = Query<{ sortBy: keyof Omit<CommentDB, 'commentatorInfo'>, }>
