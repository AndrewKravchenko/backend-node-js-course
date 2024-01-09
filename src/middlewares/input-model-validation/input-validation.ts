import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { HTTP_STATUS } from '../../constants/httpStatus'
import { Error, ErrorMessage } from '../../models/common'

export const inputValidation = (req: Request, res: Response, next: NextFunction) => {
  const formattedError = validationResult(req).formatWith((error) => {
    switch (error.type) {
      case 'field':
        return {
          message: error.msg,
          field: error.path,
        }

      default:
        return {
          message: error.msg,
          field: 'Unknown',
        }
    }
  })

  if (!formattedError.isEmpty()) {
    const errorsMessages: ErrorMessage[] = formattedError.array({ onlyFirstError: true })
    const errors: Error = {
      errorsMessages
    }

    res.status(HTTP_STATUS.BAD_REQUEST).send(errors)
    return
  }

  next()
}
