import { Response, Router } from 'express'
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '../models/common'
import { QueryUsers } from '../models/users/input/query'
import { authMiddleware } from '../middlewares/auth/auth'
import { CreateUser } from '../models/users/input/create'
import { UserRepository } from '../repositories/user'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '../../constants/httpStatus'
import { usersService } from '../services/user'
import { userValidation } from '../validators/user'

export const usersRouter = Router({})

usersRouter.get('/', authMiddleware, async (req: RequestWithQuery<QueryUsers>, res: Response) => {
  const { sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm } = req.query
  const sortData: QueryUsers = {
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    searchLoginTerm,
    searchEmailTerm,
  }

  const users = await UserRepository.getAllUsers(sortData)

  res.send(users)
})

usersRouter.post('/', authMiddleware, userValidation(), async (req: RequestWithBody<CreateUser>, res: Response) => {
  const { login, password, email } = req.body
  const isUserExists = await UserRepository.isUserExists(login, email)

  if (isUserExists) {
    res.sendStatus(HttpStatus.BAD_REQUEST)
    return
  }

  const createdUserId = await usersService.createUser(login, email, password)
  const createdUser = await UserRepository.getUserById(createdUserId)

  res.status(HttpStatus.CREATED).send(createdUser)
})

usersRouter.delete('/:id', authMiddleware, async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const userId = req.params.id

  if (!ObjectId.isValid(userId)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const isDeleted = await UserRepository.deleteUser(userId)

  if (isDeleted) {
    res.sendStatus(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})
