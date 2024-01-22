import { Request, Response, Router } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'
import { db } from '../db/db'

export const deleteAllDataRoute = Router({})

deleteAllDataRoute.delete('/', async (req: Request, res: Response) => {
  await db.dropDatabase()

  res.sendStatus(HTTP_STATUS.NO_CONTENT)
})
