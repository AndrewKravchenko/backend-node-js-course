import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { commonQueryValidation } from './common'
import { param, query } from 'express-validator'
import { queryValidation } from '../middlewares/input-model-validation/query-validation'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { postsSortByQueryValidation } from './posts-validator'

const nameValidation = validateBodyString('name', 1, 15)
  .withMessage('Incorrect name!')

const descriptionValidation = validateBodyString('description', 1, 500)
  .withMessage('Incorrect description!')

const websiteUrlValidation = validateBodyString('websiteUrl', 1, 100)
  .matches('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$')
  .withMessage('Incorrect websiteUrl!')

const searchNameTermQueryValidation = query('searchNameTerm')
  .if(
    query('searchNameTerm').not().isString()
  )
  .customSanitizer(() => null)

const blogsSortByQueryValidation = query('sortBy')
  .if(
    query('sortBy').not().isIn(['name', 'description', 'websiteUrl', 'createdAt', 'isMembership'])
  )
  .customSanitizer(() => 'createdAt')

export const checkBlogIdValidity = async (blogId: string) => {
  const blog = await BlogsQueryRepository.getBlogById(blogId)

  if (!blog) {
    throw new Error('Blog not found');
  }
}
export const blogIdParamValidation = param('blogId')
  .isMongoId()
  .custom(checkBlogIdValidity)

export const blogIdValidation = () => [
  blogIdParamValidation,
  queryValidation
]
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
