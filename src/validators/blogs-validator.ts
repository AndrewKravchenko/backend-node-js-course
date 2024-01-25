import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { commonQueryValidation } from './common'
import { query } from 'express-validator'
import { postsSortByQueryValidation } from './posts-validator'
import { BlogsSortOptions } from '../models/blogs/input/query'

const nameValidation = validateBodyString('name', 1, 15)
  .withMessage('Incorrect name!')

const descriptionValidation = validateBodyString('description', 1, 500)
  .withMessage('Incorrect description!')

const websiteUrlValidation = validateBodyString('websiteUrl', 1, 100)
  .matches('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$')
  .withMessage('Incorrect websiteUrl!')

const searchNameTermQueryValidation = query('searchNameTerm')
  .if(query('searchNameTerm').not().isString())
  .customSanitizer(() => null)

const blogsSortOptions: BlogsSortOptions[] = ['name', 'description', 'websiteUrl', 'createdAt', 'isMembership']
const blogsSortByQueryValidation = query('sortBy')
  .if(query('sortBy').not().isIn(blogsSortOptions))
  .customSanitizer(() => 'createdAt')

export const blogsValidation = () => [
  searchNameTermQueryValidation,
  blogsSortByQueryValidation,
  ...commonQueryValidation()
]
export const postsByBlogIdValidation = () => [
  postsSortByQueryValidation,
  ...commonQueryValidation()
]
export const blogValidation = () => [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
  inputValidation
]
