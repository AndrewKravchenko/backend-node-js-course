import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'

const contentValidation = validateBodyString('content', 20, 300)
  .withMessage('Incorrect content!')

export const commentValidation = () => [contentValidation, inputValidation]
