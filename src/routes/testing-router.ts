import { Request, Response, Router } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'
import { blogCollection, postCollection, userCollection } from '../db/db'
// import { database } from '../db/db'

export const deleteAllDataRoute = Router({})

deleteAllDataRoute.delete('/', async (req: Request, res: Response) => {
  // await database.dropDatabase()

  await blogCollection.deleteMany({})
  await postCollection.deleteMany({})
  await userCollection.deleteMany({})

  res.sendStatus(HTTP_STATUS.NO_CONTENT)
})
