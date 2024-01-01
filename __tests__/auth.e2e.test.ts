import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HttpStatus } from '../constants/httpStatus'
import { MongoClient } from 'mongodb'
import { paths } from '../constants/paths'
import { CreateUser } from '../src/models/users/input/create'

const defaultRoute = paths.auth
const authLogin = process.env.AUTH_LOGIN || ''
const authPassword = process.env.AUTH_PASSWORD || ''

const mongoURI = process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/test'

describe('/auth', () => {
  const client = new MongoClient(mongoURI)
  const user: CreateUser = {
    login: 'test',
    email: 'test@gmail.com',
    password: 'some_password'
  }

  beforeAll(async () => {
    await client.connect()
    await request(app).delete(paths.testing).expect(HttpStatus.NO_CONTENT)
    const response = await request(app)
      .post(paths.users)
      .auth(authLogin, authPassword)
      .send(user)
  })
  afterAll(async () => {
    await client.close()
  })

  it('POST should respond with 401 status when login credentials are incorrect', async function () {
    await request(app)
      .post(`${defaultRoute}/login`)
      .auth(authLogin, authPassword)
      .send({ loginOrEmail: 'user', password: 'password' })
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('POST should respond with 204 status when login credentials are correct', async function () {
    await request(app)
      .post(`${defaultRoute}/login`)
      .auth(authLogin, authPassword)
      .send({ loginOrEmail: user!.email, password: user!.password })
      .expect(HttpStatus.NO_CONTENT)

    await request(app)
      .post(`${defaultRoute}/login`)
      .auth(authLogin, authPassword)
      .send({ loginOrEmail: user!.login, password: user!.password })
      .expect(HttpStatus.NO_CONTENT)
  })
})
