import { Response, Router } from 'express'
import { RequestWithBody } from '../models/common'
import { AuthLogin } from '../models/auth/input/create'
import { UsersService } from '../services/users-service'
import { HTTP_STATUS } from '../constants/httpStatus'
import { jwtService } from '../services/jwt-service'
import { matchedData } from 'express-validator'
import { authLoginValidation } from '../validators/auth-validator'
import { bearerAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'

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

authRouter.post('/login', authLoginValidation(), async (req: RequestWithBody<AuthLogin>, res: Response) => {
  const credentials = matchedData(req) as AuthLogin
  const user = await UsersService.checkCredentials(credentials)

  if (user) {
    const token = jwtService.createJWT(user._id.toString())
    res.status(HTTP_STATUS.OK).send({ accessToken: token })
  } else {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
  }
})
