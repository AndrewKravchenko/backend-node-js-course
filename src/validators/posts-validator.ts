import { body, query } from 'express-validator'
import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { commonQueryValidation } from './common'

const titleValidation = validateBodyString('title', 1, 30)
  .withMessage('Incorrect title!')

const shortDescriptionValidation = validateBodyString('shortDescription', 1, 100)
  .withMessage('Incorrect shortDescription!')

const contentValidation = validateBodyString('content', 1, 1000)
  .withMessage('Incorrect content!')

const blogIdBodyValidation = body('blogId')
  .isMongoId()
  .custom(async (value) => {
    const blog = await BlogsQueryRepository.getBlogById(value)

    if (!blog) {
      throw Error('Incorrect blogId!')
    }

    return true
  })
  .withMessage('Incorrect blogId!')

export const postsSortByQueryValidation = query('sortBy')
  .if(
    query('sortBy').not().isIn(['title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt'])
  )
  .customSanitizer(() => 'createdAt')

export const postsGetValidation = () => [
  postsSortByQueryValidation,
  ...commonQueryValidation()
]
export const postValidation = () => [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdBodyValidation,
  inputValidation
]
export const postToBlogValidation = () => [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  inputValidation
]
