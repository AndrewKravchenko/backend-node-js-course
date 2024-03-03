export enum ResultCode {
  Success,
  BadRequest,
  Unauthorized,
  NotFound,
}

export type Result<T = null> = {
  resultCode: ResultCode
  errorMessage?: string
  data?: T
 }
