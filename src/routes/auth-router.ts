import { Response, Router } from 'express'
import { ErrorMessage, RequestWithBody } from '../models/common'
import { AuthLogin, RegistrationConfirmationCode, RegistrationEmailResending } from '../models/auth/input/create'
import { UsersService } from '../services/users-service'
import { HTTP_STATUS } from '../constants/httpStatus'
import { jwtService } from '../services/jwt-service'
import { matchedData } from 'express-validator'
import {
  authLoginValidation,
  confirmRegistrationValidation,
  resendRegistrationEmailValidation
} from '../validators/auth-validator'
import { bearerAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { userValidation } from '../validators/users-validator'
import { CreateUser } from '../models/users/input/create'
import { AuthService } from '../services/auth-service'

export const authRouter = Router({})

authRouter.get('/me', bearerAuthMiddleware, async (req: RequestWithBody<AuthLogin>, res: Response) => {
  const userId = req.userId

  if (!userId) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
    return
  }

  const user = await UsersQueryRepository.getUserById(userId)
  if (user) {
    res.status(HTTP_STATUS.OK).send(user)
  } else {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
  }
})

authRouter.post('/login', authLoginValidation(),
  async (req: RequestWithBody<AuthLogin>, res: Response) => {
    const credentials = matchedData(req) as AuthLogin
    const user = await UsersService.checkCredentials(credentials)

    if (user) {
      const token = jwtService.createJWT(user._id.toString())
      res.status(HTTP_STATUS.OK).send({ accessToken: token })
    } else {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
    }
  })

authRouter.post('/registration', userValidation(), async (req: RequestWithBody<CreateUser>, res: Response) => {
  const newUser = matchedData(req) as CreateUser
  const user = await UsersQueryRepository.isUserExists(newUser.login, newUser.email)

  if (user) {
    let incorrectField = 'email'
    if(user.login === newUser.login) {
      incorrectField = 'login'
    }
    const errorsMessages: ErrorMessage[] =  [{
      message: `Incorrect ${incorrectField}!`,
      field: incorrectField,
    }]


    res.status(HTTP_STATUS.BAD_REQUEST).send({ errorsMessages })
    return
  }
  await AuthService.createUser(newUser)

  res.sendStatus(HTTP_STATUS.NO_CONTENT)
})

authRouter.post('/registration-confirmation', confirmRegistrationValidation(),
  async (req: RequestWithBody<RegistrationConfirmationCode>, res: Response) => {
    const { code } = matchedData(req) as RegistrationConfirmationCode
    const isConfirmed = await AuthService.confirmEmail(code)

    if (isConfirmed) {
      res.sendStatus(HTTP_STATUS.NO_CONTENT)
    } else {
      const errorsMessages: ErrorMessage[] =  [{
        message: 'Incorrect code!',
        field: 'code',
      }]

      res.status(HTTP_STATUS.BAD_REQUEST).send({ errorsMessages })
    }
  })

authRouter.post('/registration-email-resending', resendRegistrationEmailValidation(),
  async (req: RequestWithBody<RegistrationEmailResending>, res: Response) => {
    const { email } = matchedData(req) as RegistrationEmailResending
    const isResend = await AuthService.resendRegistrationEmail(email)

    if (isResend) {
      res.sendStatus(HTTP_STATUS.NO_CONTENT)
    } else {
      const errorsMessages: ErrorMessage[] =  [{
          message: 'Incorrect email!',
          field: 'email',
        }]

      res.status(HTTP_STATUS.BAD_REQUEST).send({ errorsMessages })
    }
  })
