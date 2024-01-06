import { PATHS } from '../src/constants/paths'
import { HTTP_STATUS } from '../src/constants/httpStatus'
import { app } from '../src/settings'
import request from 'supertest'
import { MongoClient } from 'mongodb'

const mongoURI = process.env.MONGO_URI || `mongodb://0.0.0.0:27017/test`

export const setupTestEnvironment = async (setupBeforeTest?: () => Promise<void>) => {
  const client = new MongoClient(mongoURI)

  beforeAll(async () => {
    await client.connect()
    await request(app).delete(PATHS.testing).expect(HTTP_STATUS.NO_CONTENT)
    await setupBeforeTest?.()
  })

  afterAll(async () => {
    await client.close()
  })
}
