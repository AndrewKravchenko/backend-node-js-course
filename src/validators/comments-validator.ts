import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { commonQueryValidation } from './common'
import { postIdParamValidation, postsSortByQueryValidation } from './posts-validator'
import { param } from 'express-validator'
import { queryValidation } from '../middlewares/input-model-validation/query-validation'
import { likeStatusValidation } from './likes-validator'

const contentValidation = validateBodyString('content', 20, 300)
  .withMessage('Incorrect content!')

const commentIdParamValidation = param('commentId')
  .isMongoId()
  .withMessage('Incorrect commentId!')


export const updateCommentValidation = () => [
  commentIdParamValidation,
  contentValidation,
  inputValidation
]

export const createCommentLikeValidation = () => [
  commentIdParamValidation,
  likeStatusValidation,
  inputValidation
]

export const commentsByPostIdValidation = () => [
  postsSortByQueryValidation,
  ...commonQueryValidation()
]

export const commentToPostValidation = () => [
  postIdParamValidation,
  queryValidation,

  contentValidation,
  postsSortByQueryValidation,
  ...commonQueryValidation(),
  inputValidation,
]
