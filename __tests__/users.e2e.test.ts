import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HttpStatus } from '../constants/httpStatus'
import { MongoClient } from 'mongodb'
import { paths } from '../constants/paths'
import { OutputUser } from '../src/models/users/output/output'
import { CreateUser } from '../src/models/users/input/create'

const defaultRoute = paths.users
const authLogin = process.env.AUTH_LOGIN || ''
const authPassword = process.env.AUTH_PASSWORD || ''

const dbName = 'users'
const mongoURI = process.env.MONGO_URI || `mongodb://0.0.0.0:27017/${dbName}`

const incorrectId = 876328
let user: OutputUser | null = null
const emptyResponse = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: []
}

describe('/users', () => {
  const client = new MongoClient(mongoURI)

  beforeAll(async () => {
    await client.connect()
    await request(app).delete(paths.testing).expect(HttpStatus.NO_CONTENT)
  })
  afterAll(async () => {
    user = null
    await client.close()
  })

  it('GET users = []', async () => {
    await request(app)
      .get(defaultRoute)
      .auth(authLogin, authPassword)
      .expect(200, emptyResponse)
  })

  it('POST should not create the user with empty fields', async function () {
    const newUser: CreateUser = { login: '', email: '', password: '' }

    await request(app)
      .post(defaultRoute)
      .auth(authLogin, authPassword)
      .send(newUser)
      .expect(HttpStatus.BAD_REQUEST, {
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
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('POST should create the user with correct data)', async function () {
    const newUser: CreateUser = {
      login: 'test',
      email: 'test@gmail.com',
      password: 'some_password'
    }

    const response = await request(app)
      .post(defaultRoute)
      .auth(authLogin, authPassword)
      .send(newUser)
      .expect(HttpStatus.CREATED)

    user = response.body

    await request(app)
      .get(defaultRoute)
      .auth(authLogin, authPassword)
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
      .auth(authLogin, authPassword)
      .expect(HttpStatus.NOT_FOUND)
  })

  it('DELETE should not delete the user without authentication', async function () {
    await request(app)
      .delete(`${defaultRoute}/${user!.id}`)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('DELETE user by correct ID should return 204', async () => {
    await request(app)
      .delete(`${defaultRoute}/${user!.id}`)
      .auth(authLogin, authPassword)
      .expect(HttpStatus.NO_CONTENT)

    const { body } = await request(app)
      .get(defaultRoute)
      .auth(authLogin, authPassword)

    expect(body.totalCount).toBe(0)
  })
})
