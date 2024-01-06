import { body, param } from 'express-validator'
import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { checkBlogIdValidity } from './common'
import { queryValidation } from '../middlewares/input-model-validation/query-validation'

const titleValidation = validateBodyString('title', 1, 30)
  .withMessage('Incorrect title!')

const shortDescriptionValidation = validateBodyString('shortDescription', 1, 100)
  .withMessage('Incorrect shortDescription!')

const contentValidation = validateBodyString('content', 1, 1000)
  .withMessage('Incorrect content!')

const blogIdValidation = body('blogId')
  .isMongoId()
  .custom(async (value) => {
    const blog = await BlogsQueryRepository.getBlogById(value)

    if (!blog) {
      throw Error('Incorrect blogId!')
    }

    return true
  })
  .withMessage('Incorrect blogId!')

export const blogIdParamValidation = param('blogId').isMongoId().custom(checkBlogIdValidity)

export const postValidation = () => [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
  inputValidation
]
export const postToBlogValidation = () => [
  blogIdParamValidation,
  queryValidation,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  inputValidation
]
