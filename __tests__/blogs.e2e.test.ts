import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HttpStatus } from '../constants/httpStatus'
import { MongoClient } from 'mongodb'
import { paths } from '../constants/paths'
import { CreateBlog } from '../src/models/blogs/input/create'
import { OutputBlog } from '../src/models/blogs/output/output'
import { UpdateBlog } from '../src/models/blogs/input/update'

const defaultRoute = paths.blogs
const authLogin = process.env.AUTH_LOGIN || ''
const authPassword = process.env.AUTH_PASSWORD || ''

const dbName = 'blogs'
const mongoURI = process.env.MONGO_URI || `mongodb://0.0.0.0:27017/${dbName}`

const incorrectId = 876328
let newBlog: OutputBlog | null = null
const emptyResponse = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: []
}

describe('/blogs', () => {
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
    await request(app).get(defaultRoute).expect(200, emptyResponse)
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
    expect(res.body).toEqual(emptyResponse)
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
    expect(res.body).toEqual(emptyResponse)
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

    await request(app).get(defaultRoute).expect(
      {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [newBlog]
      }
    )
  })

  it('POST should create the post to blog with correct data)', async function () {
    const post = {
      title: 'Test Post',
      shortDescription: 'This is a test post',
      content: 'some content',
    }

    await request(app)
      .post(`${defaultRoute}/${newBlog!.id}/posts`)
      .auth(authLogin, authPassword)
      .send(post)
      .expect(HttpStatus.CREATED)
  })

  it('GET /blogs/:id/posts should return posts for a valid blog ID', async () => {
    const response = await request(app)
      .get(`${defaultRoute}/${newBlog!.id}/posts`)
      .query({ sortBy: 'createdAt', sortDirection: 'desc', pageNumber: 1, pageSize: 10 })

    expect(response.status).toBe(200)
  })

  it('GET /blogs/:id/posts should return 404 for an invalid blog ID', async () => {
    const response = await request(app).get(`${defaultRoute}/${incorrectId}/posts`)

    expect(response.status).toBe(404)
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

    const { body } = await request(app).get(`${defaultRoute}/${newBlog!.id}`)
    expect(body).toEqual(newBlog)
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

    const { body } = await request(app).get(`${defaultRoute}/${newBlog!.id}`)
    expect(body).toEqual({
      ...newBlog,
      ...blog,
    })
    newBlog = body
  })

  it('DELETE blog by incorrect ID should return 404', async () => {
    await request(app)
      .delete(`${defaultRoute}/${incorrectId}`)
      .auth(authLogin, authPassword)
      .expect(HttpStatus.NOT_FOUND)

    const { body } = await request(app).get(defaultRoute)
    expect(body.items[0]).toEqual(newBlog)
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

    const { body } = await request(app).get(defaultRoute)
    expect(body.totalCount).toBe(0)
  })
})
