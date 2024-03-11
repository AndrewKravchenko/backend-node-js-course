import { body, param, query } from 'express-validator'
import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { commonQueryValidation } from './common'
import { CommentsSortOptions } from '../models/comments/input/query'
import { likeStatusValidation } from './likes-validator'

export const postIdParamValidation = param('postId')
  .isMongoId()
  .withMessage('Incorrect postId!')

const titleValidation = validateBodyString('title', 1, 30)
  .withMessage('Incorrect title!')

const shortDescriptionValidation = validateBodyString('shortDescription', 1, 100)
  .withMessage('Incorrect shortDescription!')

const contentValidation = validateBodyString('content', 1, 1000)
  .withMessage('Incorrect content!')

const blogIdValidation = body('blogId')
  .isMongoId()
  .withMessage('Incorrect blogId!')

export const blogIdParamValidation = param('blogId')
  .isMongoId()

const commentsSortOptions: CommentsSortOptions[] = ['content', 'createdAt']
export const postsSortByQueryValidation = query('sortBy')
  .if(query('sortBy').not().isIn(commentsSortOptions))
  .customSanitizer(() => 'createdAt')

export const createPostLikeValidation = () => [
  postIdParamValidation,
  likeStatusValidation,
  inputValidation
]

export const postsGetValidation = () => [
  postsSortByQueryValidation,
  ...commonQueryValidation()
]
export const postValidation = () => [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
  inputValidation
]
export const postToBlogValidation = () => [
  blogIdParamValidation,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  inputValidation
]
