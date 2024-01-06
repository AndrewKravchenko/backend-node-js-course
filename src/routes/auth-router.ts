import { Response, Router } from 'express'
import { RequestWithBody } from '../models/common'
import { AuthLogin } from '../models/auth/input/create'
import { UsersService } from '../services/users-service'
import { HTTP_STATUS } from '../constants/httpStatus'

export const authRouter = Router({})

authRouter.post('/login', async (req: RequestWithBody<AuthLogin>, res: Response) => {
  const { loginOrEmail, password } = req.body

  const isAuthenticated  = await UsersService.checkCredentials(loginOrEmail, password)

  if (isAuthenticated) {
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
  }
})
