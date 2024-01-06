import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'

const nameValidation = validateBodyString('name', 1, 15)
  .withMessage('Incorrect name!')

const descriptionValidation = validateBodyString('description', 1, 500)
  .withMessage('Incorrect description!')

const websiteUrlValidation = validateBodyString('websiteUrl', 1, 100)
  .matches('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$')
  .withMessage('Incorrect websiteUrl!')

export const blogValidation = () => [nameValidation, descriptionValidation, websiteUrlValidation, inputValidation]
