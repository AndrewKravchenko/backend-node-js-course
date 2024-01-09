import { Query } from '../../common'
import { BlogDB } from '../../db/db'

export type QueryBlog = Query<{ searchNameTerm: string | null, sortBy: keyof BlogDB, }>
export type QueryPostByBlogId = Query<{ sortBy: keyof BlogDB, }>
