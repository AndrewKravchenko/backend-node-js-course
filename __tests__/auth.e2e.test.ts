import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HTTP_STATUS } from '../src/constants/httpStatus'
import { PATHS } from '../src/constants/paths'
import { CreateUser } from '../src/models/users/input/create'
import { setupTestEnvironment } from './utils'
import { authCredentials } from './constants'

const defaultRoute = PATHS.auth

describe('/auth', () => {
  const user: CreateUser = {
    login: 'test',
    email: 'test@gmail.com',
    password: 'some_password'
  }
  const createUser = async () => {
     await request(app)
      .post(PATHS.users)
      .auth(...authCredentials)
      .send(user)
  }
  setupTestEnvironment(createUser)

  it('POST should respond with 401 status when login credentials are incorrect', async function () {
    await request(app)
      .post(`${defaultRoute}/login`)
      .auth(...authCredentials)
      .send({ loginOrEmail: 'user', password: 'password' })
      .expect(HTTP_STATUS.UNAUTHORIZED)
  })

  it('POST should respond with 204 status when login credentials are correct', async function () {
    await request(app)
      .post(`${defaultRoute}/login`)
      .auth(...authCredentials)
      .send({ loginOrEmail: user!.email, password: user!.password })
      .expect(HTTP_STATUS.NO_CONTENT)

    await request(app)
      .post(`${defaultRoute}/login`)
      .auth(...authCredentials)
      .send({ loginOrEmail: user!.login, password: user!.password })
      .expect(HTTP_STATUS.NO_CONTENT)
  })
})
