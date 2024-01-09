import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { commonQueryValidation } from './common'
import { postsSortByQueryValidation } from './posts-validator'
import { param } from 'express-validator'
import { PostsQueryRepository } from '../repositories/query/posts-query-repository'
import { queryValidation } from '../middlewares/input-model-validation/query-validation'

const contentValidation = validateBodyString('content', 20, 300)
  .withMessage('Incorrect content!')

export const checkPostIdValidity = async (postId: string) => {
  const post = await PostsQueryRepository.getPostById(postId)

  if (!post) {
    throw new Error('Post not found')
  }
}

const postIdParamValidation = param('postId')
  .isMongoId()
  .custom(checkPostIdValidity)

export const updateCommentValidation = () => [
  contentValidation,
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
