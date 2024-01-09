import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'

const loginValidation = validateBodyString('login', 3, 10)
  .matches('^[a-zA-Z0-9_-]*$')
  .withMessage('Incorrect login!')

const emailValidation = validateBodyString('email', 5, 50)
  .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  .withMessage('Incorrect email!')

export const passwordValidation = validateBodyString('password', 6, 20)
  .withMessage('Incorrect password!')

export const userValidation = () => [loginValidation, emailValidation, passwordValidation, inputValidation]
