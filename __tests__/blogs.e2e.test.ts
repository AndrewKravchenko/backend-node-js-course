import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HTTP_STATUS } from '../src/constants/httpStatus'
import { PATHS } from '../src/constants/paths'
import { CreateBlog } from '../src/models/blogs/input/create'
import { OutputBlog } from '../src/models/blogs/output/output'
import { UpdateBlog } from '../src/models/blogs/input/update'
import { setupTestEnvironment } from './utils'
import { authCredentials } from './constants'

const defaultRoute = PATHS.blogs

describe('/blogs', () => {
  let newBlog: OutputBlog | null = null
  const incorrectId = 876328
  const emptyResponse = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
  }
  setupTestEnvironment()

  it('GET blogs = []', async () => {
    await request(app).get(defaultRoute).expect(200, emptyResponse)
  })

  it('POST should not create the blog with empty fields', async function () {
    const blog: CreateBlog = { name: '', websiteUrl: '', description: '' }

    await request(app)
      .post(defaultRoute)
      .auth(...authCredentials)
      .send(blog)
      .expect(HTTP_STATUS.BAD_REQUEST, {
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
      .expect(HTTP_STATUS.UNAUTHORIZED)

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
      .auth(...authCredentials)
      .send(blog)
      .expect(HTTP_STATUS.CREATED)

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
      .auth(...authCredentials)
      .send(post)
      .expect(HTTP_STATUS.CREATED)
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
    await request(app).get(`${defaultRoute}/${incorrectId}`).expect(HTTP_STATUS.NOT_FOUND)
  })

  it('GET blog by ID with correct id should return the blog', async () => {
    await request(app)
      .get(`${defaultRoute}/${newBlog!.id}`)

      .expect(HTTP_STATUS.OK, newBlog)
  })

  it('PUT blog by ID with incorrect data should return 404', async () => {
    const blog: CreateBlog = {
      name: 'Test Blog',
      description: 'This is a test blog',
      websiteUrl: 'bad url',
    }
    await request(app)
      .put(`${defaultRoute}/${newBlog!.id}`)
      .auth(...authCredentials)
      .send(blog)
      .expect(HTTP_STATUS.BAD_REQUEST)

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
      .expect(HTTP_STATUS.UNAUTHORIZED)
  })

  it('PUT blog by ID with correct data should update the blog', async () => {
    const blog: UpdateBlog = {
      name: 'Updated Blog',
      description: 'Updated blog description',
      websiteUrl: 'https://www.updated-example.com',
    }
    await request(app)
      .put(`${defaultRoute}/${newBlog!.id}`)
      .auth(...authCredentials)
      .send(blog)
      .expect(HTTP_STATUS.NO_CONTENT)

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
      .auth(...authCredentials)
      .expect(HTTP_STATUS.NOT_FOUND)

    const { body } = await request(app).get(defaultRoute)
    expect(body.items[0]).toEqual(newBlog)
  })

  it('DELETE should not delete the blog without authentication', async function () {
    await request(app)
      .delete(`${defaultRoute}/${newBlog!.id}`)
      .expect(HTTP_STATUS.UNAUTHORIZED)
  })

  it('DELETE blog by correct ID should return 204', async () => {
    await request(app)
      .delete(`${defaultRoute}/${newBlog!.id}`)
      .auth(...authCredentials)
      .expect(HTTP_STATUS.NO_CONTENT)

    const { body } = await request(app).get(defaultRoute)
    expect(body.totalCount).toBe(0)
  })
})
