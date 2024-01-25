import { Response, Router } from 'express'
import { RequestWithBody, RequestWithParams, RequestWithQuery, UserId } from '../models/common'
import { QueryUser } from '../models/users/input/query'
import { basicAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { CreateUser } from '../models/users/input/create'
import { HTTP_STATUS } from '../constants/httpStatus'
import { UsersService } from '../services/users-service'
import { usersGetValidation, userValidation } from '../validators/users-validator'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { matchedData } from 'express-validator'

export const usersRouter = Router({})

usersRouter.get('/', basicAuthMiddleware, usersGetValidation(), async (req: RequestWithQuery<Partial<QueryUser>>, res: Response) => {
  const query = matchedData(req, { locations: ['query'] }) as QueryUser
  const users = await UsersQueryRepository.getUsers(query)

  res.send(users)
})

usersRouter.post('/', basicAuthMiddleware, userValidation(), async (req: RequestWithBody<CreateUser>, res: Response) => {
  try {
    const newUser = matchedData(req) as CreateUser
    const createdUser = await UsersService.createUser(newUser, false)

    res.status(HTTP_STATUS.CREATED).send(createdUser)
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).send(error)
  }
})

usersRouter.delete('/:userId', basicAuthMiddleware, async (req: RequestWithParams<UserId>, res: Response) => {
  const isDeleted = await UsersService.deleteUser(req.params.userId)

  if (isDeleted) {
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})
