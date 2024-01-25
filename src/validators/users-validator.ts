import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { commonQueryValidation } from './common'
import { query } from 'express-validator'
import { UsersSortOptions } from '../models/users/input/query'

const loginValidation = validateBodyString('login', 3, 10)
  .matches('^[a-zA-Z0-9_-]*$')
  .withMessage('Incorrect login!')

export const emailValidation = validateBodyString('email', 5, 50)
  .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  .withMessage('Incorrect email!')

export const passwordValidation = validateBodyString('password', 6, 20)
  .withMessage('Incorrect password!')

const searchLoginTermQueryValidation = query('searchLoginTerm')
  .if(query('searchLoginTerm').not().isString())
  .customSanitizer(() => null)

const searchEmailTermQueryValidation = query('searchEmailTerm')
  .if(query('searchEmailTerm').not().isString())
  .customSanitizer(() => null)

const usersSortOptions: UsersSortOptions[] = ['email', 'login', 'createdAt', 'isDeleted']
export const usersSortByQueryValidation = query('sortBy')
  .if(query('sortBy').not().isIn(usersSortOptions))
  .customSanitizer(() => 'createdAt')

export const usersGetValidation = () => [
  searchLoginTermQueryValidation,
  searchEmailTermQueryValidation,
  usersSortByQueryValidation,
  ...commonQueryValidation()
]
export const userValidation = () => [
  loginValidation,
  emailValidation,
  passwordValidation,
  inputValidation
]
