import 'dotenv/config'
import request from 'supertest'
import { app } from '../src/settings'
import { HttpStatus } from '../src/utils'
import { MongoClient } from 'mongodb'
import { paths } from '../src/routes/paths'
import { CreateBlog } from '../src/models/blogs/input/create'
import { OutputBlog } from '../src/models/blogs/output/output'
import { OutputPost } from '../src/models/posts/output/output'
import { CreatePost } from '../src/models/posts/input/create'
import { UpdatePost } from '../src/models/posts/input/update'

const defaultRoute = paths.posts
const authLogin = process.env.AUTH_LOGIN || ''
const authPassword = process.env.AUTH_PASSWORD || ''

const dbName = 'posts'
const mongoURI = process.env.MONGO_URI || `mongodb://0.0.0.0:27017/${dbName}`
describe('/posts', () => {
  const incorrectId = 876328
  let newBlog: OutputBlog | null = null
  let newPost: OutputPost | null = null
  const client = new MongoClient(mongoURI)

  beforeAll(async () => {
    await client.connect()
    await request(app).delete(paths.testing).expect(HttpStatus.NO_CONTENT)

    const blog: CreateBlog = {
      name: 'Test Blog',
      description: 'This is a test blog',
      websiteUrl: 'https://www.example.com',
    }

    const response = await request(app)
      .post(paths.blogs)
      .auth(authLogin, authPassword)
      .send(blog)
      .expect(HttpStatus.CREATED)

    newBlog = response.body
  })

  afterAll(async () => {
    newPost = null
    await client.close()
  })

  it('GET posts = []', async () => {
    await request(app).get(defaultRoute).expect(200, [])
  })

  it('POST should not create the post with empty fields', async function () {
    const post: CreatePost = { blogId: '', content: '', title: '', shortDescription: '' }

    await request(app)
      .post(defaultRoute)
      .auth(authLogin, authPassword)
      .send(post)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          { message: 'Incorrect title!', field: 'title' },
          { message: 'Incorrect shortDescription!', field: 'shortDescription' },
          { message: 'Incorrect content!', field: 'content' },
          { message: 'Incorrect blogId!', field: 'blogId' }
        ],
      })

    const res = await request(app).get(defaultRoute)
    expect(res.body).toEqual([])
  })

  it('POST should not create the post without authentication', async function () {
    const post: CreatePost = {
      blogId: newBlog!.id,
      title: 'Test Post',
      shortDescription: 'This is a test post',
      content: 'some content',
    }

    await request(app)
      .post(defaultRoute)
      .send(post)
      .expect(HttpStatus.UNAUTHORIZED)

    const res = await request(app).get(defaultRoute)
    expect(res.body).toEqual([])
  })

  it('POST should create the post with correct data)', async function () {
    const post: CreatePost = {
      blogId: newBlog!.id,
      title: 'Test Post',
      shortDescription: 'This is a test post',
      content: 'some content',
    }

    const response = await request(app)
      .post(defaultRoute)
      .auth(authLogin, authPassword)
      .send(post)
      .expect(HttpStatus.CREATED)

    newPost = response.body

    await request(app).get(defaultRoute).expect([newPost])
  })

  it('GET post by ID with incorrect id should return 404', async () => {
    await request(app).get(`${defaultRoute}/${incorrectId}`).expect(HttpStatus.NOT_FOUND)
  })

  it('GET post by ID with correct id should return the post', async () => {
    await request(app)
      .get(`${defaultRoute}/${newPost!.id}`)

      .expect(HttpStatus.OK, newPost)
  })

  it('PUT post by ID with incorrect data should return 404', async () => {
    const post: CreatePost = {
      blogId: '',
      title: 'Test Post',
      shortDescription: 'This is a test post',
      content: 'some content',
    }
    await request(app)
      .put(`${defaultRoute}/${newPost!.id}`)
      .auth(authLogin, authPassword)
      .send(post)
      .expect(HttpStatus.BAD_REQUEST)

    const res = await request(app).get(defaultRoute)
    expect(res.body[0]).toEqual(newPost)
  })

  it('PUT should not update the post without authentication', async function () {
    const post: UpdatePost = {
      blogId: newBlog!.id,
      title: 'Updated Post',
      shortDescription: 'Updated post description',
      content: 'updated content',
    }

    await request(app)
      .put(`${defaultRoute}/${newPost!.id}`)
      .send(post)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('PUT post by ID with correct data should update the post', async () => {
    const post: UpdatePost = {
      blogId: newBlog!.id,
      title: 'Updated Post',
      shortDescription: 'Updated post description',
      content: 'updated content',
    }

    await request(app)
      .put(`${defaultRoute}/${newPost!.id}`)
      .auth(authLogin, authPassword)
      .send(post)
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app).get(defaultRoute)
    expect(res.body[0]).toEqual({
      ...newPost,
      ...post,
    })
    newPost = res.body[0]
  })

  it('DELETE post by incorrect ID should return 404', async () => {
    await request(app)
      .delete(`${defaultRoute}/${incorrectId}`)
      .auth(authLogin, authPassword)
      .expect(HttpStatus.NOT_FOUND)

    const res = await request(app).get(defaultRoute)
    expect(res.body[0]).toEqual(newPost)
  })

  it('DELETE should not delete the post without authentication', async function () {
    await request(app)
      .delete(`${defaultRoute}/${newPost!.id}`)
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('DELETE post by correct ID should return 204', async () => {
    await request(app)
      .delete(`${defaultRoute}/${newPost!.id}`)
      .auth(authLogin, authPassword)
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app).get(defaultRoute)
    expect(res.body.length).toBe(0)
  })
})
