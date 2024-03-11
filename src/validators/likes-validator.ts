import { body } from 'express-validator'
import { LikeStatus } from '../models/db/db'

export const likeStatusValidation = body('likeStatus')
  .isIn(Object.values(LikeStatus))
  .withMessage('Incorrect likeStatus!')

