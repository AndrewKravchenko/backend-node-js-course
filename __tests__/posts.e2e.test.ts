import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HTTP_STATUS } from '../src/constants/httpStatus'
import { PATHS } from '../src/constants/paths'
import { CreateBlog } from '../src/models/blogs/input/create'
import { OutputBlog } from '../src/models/blogs/output/output'
import { OutputPost } from '../src/models/posts/output/output'
import { CreatePost } from '../src/models/posts/input/create'
import { UpdatePost } from '../src/models/posts/input/update'
import { setupTestEnvironment } from './utils'
import { authCredentials } from './constants'

const defaultRoute = PATHS.posts

describe('/posts', () => {
  let blog: OutputBlog | null = null
  let post: OutputPost | null = null
  const incorrectId = 876328
  const newBlog: CreateBlog = {
    name: 'Test Blog',
    description: 'This is a test blog',
    websiteUrl: 'https://www.example.com',
  }
  const emptyResponse = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
  }

  const createBlog = async () => {
    const response = await request(app)
      .post(PATHS.blogs)
      .auth(...authCredentials)
      .send(newBlog)
      .expect(HTTP_STATUS.CREATED)

    blog = response.body
  }
  setupTestEnvironment(createBlog)

  it('GET posts = []', async () => {
    await request(app).get(defaultRoute).expect(200, emptyResponse)
  })

  it('POST should not create the post with empty fields', async function () {
    const post: CreatePost = { blogId: '', content: '', title: '', shortDescription: '' }

    await request(app)
      .post(defaultRoute)
      .auth(...authCredentials)
      .send(post)
      .expect(HTTP_STATUS.BAD_REQUEST, {
        errorsMessages: [
          { message: 'Incorrect title!', field: 'title' },
          { message: 'Incorrect shortDescription!', field: 'shortDescription' },
          { message: 'Incorrect content!', field: 'content' },
          { message: 'Invalid value', field: 'blogId' }
        ],
      })

    const res = await request(app).get(defaultRoute)
    expect(res.body).toEqual(emptyResponse)
  })

  it('POST should not create the post without authentication', async function () {
    const newPost: CreatePost = {
      blogId: blog!.id,
      title: 'Test Post',
      shortDescription: 'This is a test post',
      content: 'some content',
    }

    await request(app)
      .post(defaultRoute)
      .send(newPost)
      .expect(HTTP_STATUS.UNAUTHORIZED)

    const res = await request(app).get(defaultRoute)
    expect(res.body).toEqual(emptyResponse)
  })

  it('POST should create the post with correct data)', async function () {
    const newPost: CreatePost = {
      blogId: blog!.id,
      title: 'Test Post',
      shortDescription: 'This is a test post',
      content: 'some content',
    }

    const response = await request(app)
      .post(defaultRoute)
      .auth(...authCredentials)
      .send(newPost)
      .expect(HTTP_STATUS.CREATED)

    post = response.body

    await request(app).get(defaultRoute).expect({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [post]
    })
  })

  it('GET all posts with query parameters', async () => {
    await request(app)
      .get(defaultRoute)
      .query({
        pageSize: 10,
        pageNumber: 1,
        sortDirection: 'asc',
        sortBy: 'createdAt',
      })
      .expect(HTTP_STATUS.OK)
  })

  it('GET post by ID with incorrect id should return 404', async () => {
    await request(app).get(`${defaultRoute}/${incorrectId}`).expect(HTTP_STATUS.NOT_FOUND)
  })

  it('GET post by ID with correct id should return the post', async () => {
    await request(app)
      .get(`${defaultRoute}/${post!.id}`)
      .expect(HTTP_STATUS.OK, post)
  })

  it('PUT post by ID with incorrect data should return 404', async () => {
    const newPost: CreatePost = {
      blogId: '',
      title: 'Test Post',
      shortDescription: 'This is a test post',
      content: 'some content',
    }
    await request(app)
      .put(`${defaultRoute}/${post!.id}`)
      .auth(...authCredentials)
      .send(newPost)
      .expect(HTTP_STATUS.BAD_REQUEST)

    const { body } = await request(app).get(`${defaultRoute}/${post!.id}`)

    expect(body).toEqual(post)
  })

  it('PUT should not update the post without authentication', async function () {
    const newPost: UpdatePost = {
      blogId: blog!.id,
      title: 'Updated Post',
      shortDescription: 'Updated post description',
      content: 'updated content',
    }

    await request(app)
      .put(`${defaultRoute}/${post!.id}`)
      .send(newPost)
      .expect(HTTP_STATUS.UNAUTHORIZED)
  })

  it('PUT post by ID with correct data should update the post', async () => {
    const newPost: UpdatePost = {
      blogId: blog!.id,
      title: 'Updated Post',
      shortDescription: 'Updated post description',
      content: 'updated content',
    }

    await request(app)
      .put(`${defaultRoute}/${post!.id}`)
      .auth(...authCredentials)
      .send(newPost)
      .expect(HTTP_STATUS.NO_CONTENT)

    const { body } = await request(app).get(`${defaultRoute}/${post!.id}`)
    expect(body).toEqual({
      ...post,
      ...newPost,
    })
    post = body
  })

  it('DELETE post by incorrect ID should return 404', async () => {
    await request(app)
      .delete(`${defaultRoute}/${incorrectId}`)
      .auth(...authCredentials)
      .expect(HTTP_STATUS.NOT_FOUND)

    const { body } = await request(app).get(defaultRoute)
    expect(body.items[0]).toEqual(post)
  })

  it('DELETE should not delete the post without authentication', async function () {
    await request(app)
      .delete(`${defaultRoute}/${post!.id}`)
      .expect(HTTP_STATUS.UNAUTHORIZED)
  })

  it('DELETE post by correct ID should return 204', async () => {
    await request(app)
      .delete(`${defaultRoute}/${post!.id}`)
      .auth(...authCredentials)
      .expect(HTTP_STATUS.NO_CONTENT)

    const { body } = await request(app).get(defaultRoute)
    expect(body.items.length).toBe(0)
  })
})
