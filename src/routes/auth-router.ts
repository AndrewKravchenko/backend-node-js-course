import { Request, Response, Router } from 'express'
import { ErrorMessage, RequestWithBody } from '../models/common'
import { AuthLogin, RegistrationConfirmationCode, RegistrationEmailResending } from '../models/auth/input/create'
import { matchedData } from 'express-validator'
import {
  authLoginValidation,
  confirmRegistrationValidation,
  resendRegistrationEmailValidation
} from '../validators/auth-validator'
import { bearerAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { userValidation } from '../validators/users-validator'
import { CreateUser } from '../models/users/input/create'
import { AuthService } from '../services/auth-service'
import { HTTP_STATUS } from '../constants/httpStatus'
import { rateLimiter } from '../middlewares/rateLimiter-middleware'
import useragent from 'express-useragent'

export const authRouter = Router({})

authRouter.get('/me', bearerAuthMiddleware, async (req: RequestWithBody<AuthLogin>, res: Response) => {
  const { code, data } = await AuthService.getMe(req.userId)

  res.status(code).send(data)
})

authRouter.post('/login', rateLimiter, authLoginValidation(),
  async (req: RequestWithBody<AuthLogin>, res: Response) => {
    const ip = req.ip
    const ua = useragent.parse(req.headers['user-agent'] || '')
    const deviceName = `${ua.browser} ${ua.version}`
    const credentials = matchedData(req) as AuthLogin
    const { code, data } = await AuthService.login(credentials, ip, deviceName)

    if (data) {
      res.cookie('refreshToken', data.refreshToken, { httpOnly: true, secure: true, })
      res.status(code).send({ accessToken: data.accessToken })
    } else {
      res.sendStatus(code)
    }
  })

authRouter.post('/refresh-token', async (req: Request, res: Response) => {
  const ip = req.ip
  const refreshToken = req.cookies.refreshToken
  const { code, data } = await AuthService.refreshAccessToken(refreshToken, ip)

  if (data) {
    res.cookie('refreshToken', data.refreshToken, { httpOnly: true, secure: true, })
    res.status(code).send({ accessToken: data.accessToken })
  } else {
    res.sendStatus(code)
  }
})

authRouter.post('/registration', rateLimiter, userValidation(), async (req: RequestWithBody<CreateUser>, res: Response) => {
  try {
    const newUser = matchedData(req) as CreateUser
    await AuthService.createUser(newUser)

    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).send(error as undefined | ErrorMessage[])
  }
})

authRouter.post('/registration-confirmation', rateLimiter, confirmRegistrationValidation(),
  async (req: RequestWithBody<RegistrationConfirmationCode>, res: Response) => {
    const { code: confirmationCode } = matchedData(req) as RegistrationConfirmationCode
    const { code, data } = await AuthService.confirmEmail(confirmationCode)

    res.status(code).send(data)
  })

authRouter.post('/registration-email-resending', rateLimiter, resendRegistrationEmailValidation(),
  async (req: RequestWithBody<RegistrationEmailResending>, res: Response) => {
    const { email } = matchedData(req) as RegistrationEmailResending
    const { code, data } = await AuthService.resendRegistrationEmail(email)

    res.status(code).send(data)
  })

authRouter.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken
  const { code } = await AuthService.logOut(refreshToken)

  res.sendStatus(code)
})
