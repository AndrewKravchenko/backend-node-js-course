import { Request } from 'express'

export type BlogId = { blogId: string }
export type PostId = { postId: string }
export type UserId = { userId: string }
export type CommentId = { commentId: string }
export type RequestWithParams<P> = Request<P, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithBodyAndParams<P, B> = Request<P, {}, B, {}>
export type RequestWithQueryAndParams<P, Q> = Request<P, {}, {}, Q>

export type ErrorMessage = {
  message: string
  field: string
}
export type Error = {
  errorsMessages: ErrorMessage[]
}

export type Query<T> = {
  sortDirection: 'asc' | 'desc',
  pageNumber: number,
  pageSize: number,
} & T

