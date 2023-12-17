import { body } from 'express-validator'
import { inputValidation } from '../middlewares/input-model-validation/input'
import { BlogRepository } from '../repositories/blog'

const titleValidation = body('title').isString().trim().isLength({
  min: 1,
  max: 30
}).withMessage('Incorrect title!')
const shortDescriptionValidation = body('shortDescription').isString().trim().isLength({
  min: 1,
  max: 100
}).withMessage('Incorrect shortDescription!')
const contentValidation = body('content').isString().trim().isLength({
  min: 1,
  max: 1000
}).withMessage('Incorrect content!')
const blogIdValidation = body('blogId').isString().trim().custom((value) => {
  const blog = BlogRepository.getBlogById(value)

  if (!blog) {
    throw Error('Incorrect blogId!')
  }

  return true
}).withMessage('Incorrect blogId!')

export const postValidation = () => [titleValidation, shortDescriptionValidation, contentValidation, blogIdValidation, inputValidation]
