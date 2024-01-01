import { Response, Router } from 'express'
import { RequestWithBody } from '../models/common'
import { AuthLogin } from '../models/auth/input/create'
import { usersService } from '../services/user'
import { HttpStatus } from '../../constants/httpStatus'

export const authRouter = Router({})

authRouter.post('/login', async (req: RequestWithBody<AuthLogin>, res: Response) => {
  const { loginOrEmail, password } = req.body

  const isAuthenticated  = await usersService.checkCredentials(loginOrEmail, password)

  if (isAuthenticated) {
    res.sendStatus(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.UNAUTHORIZED)
  }
})
