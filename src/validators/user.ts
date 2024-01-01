import { body } from 'express-validator'
import { inputValidation } from '../middlewares/input-model-validation/input'

const loginValidation = body('login')
  .isString()
  .trim()
  .notEmpty()
  .isLength({ min: 3, max: 10 })
  .matches('^[a-zA-Z0-9_-]*$')
  .withMessage('Incorrect login!')

const emailValidation = body('email')
  .isString()
  .trim()
  .notEmpty()
  .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  .withMessage('Incorrect email!')

const passwordValidation = body('password')
  .isString()
  .trim()
  .notEmpty()
  .isLength({ min: 6, max: 20 })
  .withMessage('Incorrect password!')

export const userValidation = () => [loginValidation, emailValidation, passwordValidation, inputValidation]
