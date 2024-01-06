import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { HTTP_STATUS } from '../../constants/httpStatus'

export const queryValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }
  next()
}
