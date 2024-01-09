import { inputValidation } from '../middlewares/input-model-validation/input-validation'
import { validateBodyString } from '../utils/validator'
import { passwordValidation } from './users-validator'

const loginOrEmailValidation = validateBodyString('loginOrEmail', 3, 50)
  .custom((value) => {
    if (/^[a-zA-Z0-9_-]*$/.test(value)) {
      return true
    }
    if (/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
      return true
    }

    throw new Error('Incorrect loginOrEmail!');
  })
  .withMessage('Incorrect loginOrEmail!')

export const authLoginValidation = () => [loginOrEmailValidation, passwordValidation, inputValidation]
