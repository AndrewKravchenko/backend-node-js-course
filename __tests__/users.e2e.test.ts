import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HTTP_STATUS } from '../src/constants/httpStatus'
import { PATHS } from '../src/constants/paths'
import { ExtendedOutputUser } from '../src/models/users/output/output'
import { CreateUser } from '../src/models/users/input/create'
import { setupTestEnvironment } from './utils'
import { authCredentials } from './constants'

const defaultRoute = PATHS.users

describe('/users', () => {
  let user: ExtendedOutputUser | null = null
  const incorrectId = 876328
  const emptyResponse = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
  }

  setupTestEnvironment()

  it('GET users = []', async () => {
    await request(app)
      .get(defaultRoute)
      .auth(...authCredentials)
      .expect(200, emptyResponse)
  })

  it('POST should not create the user with empty fields', async function () {
    const newUser: CreateUser = { login: '', email: '', password: '' }

    await request(app)
      .post(defaultRoute)
      .auth(...authCredentials)
      .send(newUser)
      .expect(HTTP_STATUS.BAD_REQUEST, {
        errorsMessages: [
          { message: 'Invalid value', field: 'login' },
          { message: 'Invalid value', field: 'email' },
          { message: 'Incorrect password!', field: 'password' }
        ],
      })
  })

  it('POST should not create the user without authentication', async function () {
    const newUser: CreateUser = { login: '', email: '', password: '' }

    await request(app)
      .post(defaultRoute)
      .send(newUser)
      .expect(HTTP_STATUS.UNAUTHORIZED)
  })

  it('POST should create the user with correct data)', async function () {
    const newUser: CreateUser = {
      login: 'test',
      email: 'test@gmail.com',
      password: 'some_password'
    }

    const response = await request(app)
      .post(defaultRoute)
      .auth(...authCredentials)
      .send(newUser)
      .expect(HTTP_STATUS.CREATED)

    user = response.body

    await request(app)
      .get(defaultRoute)
      .auth(...authCredentials)
      .expect(
      {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [user]
      }
    )
  })

  it('DELETE user by incorrect ID should return 404', async () => {
    await request(app)
      .delete(`${defaultRoute}/${incorrectId}`)
      .auth(...authCredentials)
      .expect(HTTP_STATUS.NOT_FOUND)
  })

  it('DELETE should not delete the user without authentication', async function () {
    await request(app)
      .delete(`${defaultRoute}/${user!.id}`)
      .expect(HTTP_STATUS.UNAUTHORIZED)
  })

  it('DELETE user by correct ID should return 204', async () => {
    await request(app)
      .delete(`${defaultRoute}/${user!.id}`)
      .auth(...authCredentials)
      .expect(HTTP_STATUS.NO_CONTENT)

    const { body } = await request(app)
      .get(defaultRoute)
      .auth(...authCredentials)

    expect(body.totalCount).toBe(0)
  })
})
