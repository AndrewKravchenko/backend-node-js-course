import { Query } from '../../common'
import { BlogDB } from '../../db/db'
import { PostSortOptions } from '../../posts/input/query'

export type QueryBlog = Query<{ searchNameTerm: string | null, sortBy: BlogsSortOptions }>
export type QueryPostByBlogId = Query<{ sortBy: PostSortOptions }>
export type BlogsSortOptions = keyof BlogDB
