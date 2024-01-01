import { Request, Response, Router } from 'express'
import { HttpStatus } from '../../constants/httpStatus'
import { blogCollection, postCollection, userCollection } from '../db/db'
// import { database } from '../db/db'

export const deleteAllDataRoute = Router({})

deleteAllDataRoute.delete('/', async (req: Request, res: Response) => {
  // await database.dropDatabase()

  await blogCollection.deleteMany({})
  await postCollection.deleteMany({})
  await userCollection.deleteMany({})

  res.sendStatus(HttpStatus.NO_CONTENT)
})
