import { Request } from 'express'

export type RequestWithParams<P> = Request<P, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithBodyAndParams<B> = Request<{ id: string }, {}, B, {}>

export type ErrorMessage = {
  message: string
  field: string
}
export type Error = {
  errorsMessages: ErrorMessage[]
}
