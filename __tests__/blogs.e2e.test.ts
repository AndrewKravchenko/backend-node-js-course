import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HttpStatus } from '../src/utils'
import { MongoClient } from 'mongodb'
import { paths } from '../src/routes/paths'
import { CreateBlog } from '../src/models/blogs/input/create'
import { OutputBlog } from '../src/models/blogs/output/output'
import { UpdateBlog } from '../src/models/blogs/input/update'

const defaultRoute = paths.blogs
const authLogin = process.env.AUTH_LOGIN || ''
const authPassword = process.env.AUTH_PASSWORD || ''

const dbName = 'blogs'
const mongoURI = process.env.MONGO_URI || `mongodb://0.0.0.0:27017/${dbName}`

describe('/blogs', () => {
  const incorrectId = 876328
  let newBlog: OutputBlog | null = null
  const client = new MongoClient(mongoURI)

  beforeAll(async () => {
    await client.connect()
    await request(app).delete(paths.testing).expect(HttpStatus.NO_CONTENT)
  })
  afterAll(async () => {
    newBlog = null
    await client.close()
  })

  it('GET blogs = []', async () => {
    await request(app).get(defaultRoute).expect(200, [])
  })

  it('POST should not create the blog with empty fields', async function () {
    const blog: CreateBlog = { name: '', websiteUrl: '', description: '' }

    await request(app)
      .post(defaultRoute)
      .auth(authLogin, authPassword)
      .send(blog)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          { message: 'Incorrect name!', field: 'name' },
          { message: 'Incorrect description!', field: 'description' },
          { message: 'Invalid value', field: 'websiteUrl' }
        ],
      })

    const res = await request(app).get(defaultRoute)
    expect(res.body).toEqual([])
  })

  it('POST should not create the blog without authentication', async function () {
    const blog: CreateBlog = {
      name: 'Test Blog',
      description: 'This is a test blog',
      websiteUrl: 'https://www.example.com',
    }

    await request(app)
      .post(defaultRoute)
      .send(blog)
      .expect(HttpStatus.UNAUTHORIZED)

    const res = await request(app).get(defaultRoute)
    expect(res.body).toEqual([])
  })

  it('POST should create the blog with correct data)', async function () {
    const blog: CreateBlog = {
      name: 'Test Blog',
      description: 'This is a test blog',
      websiteUrl: 'https://www.example.com',
    }

    const response = await request(app)
      .post(defaultRoute)
      .auth(authLogin, authPassword)
      .send(blog)
      .expect(HttpStatus.CREATED)

    newBlog = response.body

    await request(app).get(defaultRoute).expect([newBlog])
  })

  it('GET blog by ID with incorrect id should return 404', async () => {
    await request(app).get(`${defaultRoute}/${incorrectId}`).expect(HttpStatus.NOT_FOUND)
  })

  it('GET blog by ID with correct id should return the blog', async () => {
    await request(app)
      .get(`${defaultRoute}/${newBlog!.id}`)

      .expect(HttpStatus.OK, newBlog)
  })

  it('PUT blog by ID with incorrect data should return 404', async () => {
    const blog: CreateBlog = {
      name: 'Test Blog',
      description: 'This is a test blog',
      websiteUrl: 'bad url',
    }
    await request(app)
      .put(`${defaultRoute}/${newBlog!.id}`)
      .auth(authLogin, authPassword)
      .send(blog)
      .expect(HttpStatus.BAD_REQUEST)

    const res = await request(app).get(defaultRoute)
    expect(res.body[0]).toEqual(newBlog)
  })

  it('PUT should not update the blog without authentication', async function () {
    const blog: UpdateBlog = {
      name: 'Updated Blog',
      description: 'Updated blog description',
      websiteUrl: 'https://www.updated-example.com',
    }
    await request(app)
      .put(`${defaultRoute}/${newBlog!.id}`)
      .send(blog)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('PUT blog by ID with correct data should update the blog', async () => {
    const blog: UpdateBlog = {
      name: 'Updated Blog',
      description: 'Updated blog description',
      websiteUrl: 'https://www.updated-example.com',
    }
    await request(app)
      .put(`${defaultRoute}/${newBlog!.id}`)
      .auth(authLogin, authPassword)
      .send(blog)
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app).get(defaultRoute)
    expect(res.body[0]).toEqual({
      ...newBlog,
      ...blog,
    })
    newBlog = res.body[0]
  })

  it('DELETE blog by incorrect ID should return 404', async () => {
    await request(app)
      .delete(`${defaultRoute}/${incorrectId}`)
      .auth(authLogin, authPassword)
      .expect(HttpStatus.NOT_FOUND)

    const res = await request(app).get(defaultRoute)
    expect(res.body[0]).toEqual(newBlog)
  })

  it('DELETE should not delete the blog without authentication', async function () {
    await request(app)
      .delete(`${defaultRoute}/${newBlog!.id}`)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('DELETE blog by correct ID should return 204', async () => {
    await request(app)
      .delete(`${defaultRoute}/${newBlog!.id}`)
      .auth(authLogin, authPassword)
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app).get(defaultRoute)
    expect(res.body.length).toBe(0)
  })
})
