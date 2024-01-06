import { body } from 'express-validator'

export const validateBodyString = (fieldName: string, minLength: number, maxLength: number) =>
  body(fieldName)
    .isString()
    .trim()
    .isLength({ min: minLength, max: maxLength })
