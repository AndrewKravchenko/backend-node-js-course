import { Response, Router } from 'express'
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '../models/common'
import { QueryUser } from '../models/users/input/query'
import { authMiddleware } from '../middlewares/auth/auth-middleware'
import { CreateUser } from '../models/users/input/create'
import { UsersRepository } from '../repositories/users-repository'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '../constants/httpStatus'
import { UsersService } from '../services/users-service'
import { userValidation } from '../validators/users-validator'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { matchedData } from 'express-validator'
import { QueryBlog } from '../models/blogs/input/query'
import { CreateBlog } from '../models/blogs/input/create'

export const usersRouter = Router({})

usersRouter.get('/', authMiddleware, async (req: RequestWithQuery<QueryUser>, res: Response) => {
  const query = matchedData(req, {locations: ['query']}) as QueryUser
  const users = await UsersQueryRepository.getUsers(query)

  res.send(users)
})

usersRouter.post('/', authMiddleware, userValidation(), async (req: RequestWithBody<CreateUser>, res: Response) => {
  const newUser = matchedData(req) as CreateUser
  const isUserExists = await UsersRepository.isUserExists(newUser.login, newUser.email)

  if (isUserExists) {
    res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    return
  }

  const createdUserId = await UsersService.createUser(newUser)
  const createdUser = await UsersQueryRepository.getUserById(createdUserId)

  res.status(HTTP_STATUS.CREATED).send(createdUser)
})

usersRouter.delete('/:id', authMiddleware, async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const userId = req.params.id

  if (!ObjectId.isValid(userId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const isDeleted = await UsersRepository.deleteUser(userId)

  if (isDeleted) {
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})
