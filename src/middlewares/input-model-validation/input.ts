import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { HttpStatus } from '../../../constants/httpStatus'

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
    const errorsMessages = formattedError.array({ onlyFirstError: true })
    const errors = {
      errorsMessages
    }

    res.status(HttpStatus.BAD_REQUEST).send(errors)
    return
  }

  next()
}
