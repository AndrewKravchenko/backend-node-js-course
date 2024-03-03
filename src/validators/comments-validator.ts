import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { commonQueryValidation } from './common'
import { postsSortByQueryValidation } from './posts-validator'
import { body, param } from 'express-validator'
import { queryValidation } from '../middlewares/input-model-validation/query-validation'
import { LikeStatus } from '../models/db/db'

const contentValidation = validateBodyString('content', 20, 300)
  .withMessage('Incorrect content!')

const postIdParamValidation = param('postId')
  .isMongoId()
  .withMessage('Incorrect postId!')

const commentIdParamValidation = param('commentId')
  .isMongoId()
  .withMessage('Incorrect commentId!')

const likeStatusValidation = body('likeStatus')
  .isIn(Object.values(LikeStatus))
  .withMessage('Incorrect likeStatus!')


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
