import request from 'supertest'
import { app } from '../src/settings'
import { HttpStatus } from '../src/utils'
import { Routes } from '../src/routes/routes'
import { Video } from '../src/models/videos/output'
import { AvailableResolutions, CreateVideo } from '../src/models/videos/input'

describe('/videos', () => {
  const incorrectId = 876328
  let newVideo: Video | null = null

  beforeAll(async () => {
    await request(app).delete(`${Routes.testing}/all-data`).expect(HttpStatus.NO_CONTENT)
  })
  afterAll(() => {
    newVideo = null
  })

  it('GET videos = []', async () => {
    await request(app).get(Routes.videos).expect(200, [])
  })

  it('POST should not create the video with incorrect data (no title, no author)', async function () {
    await request(app)
      .post(Routes.videos)
      .send({ title: '', author: '' })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          { message: 'Invalid title', field: 'title' },
          { message: 'Invalid author', field: 'author' },
        ],
      })

    const res = await request(app).get(Routes.videos)
    expect(res.body).toEqual([])
  })

  it('POST should create the video with correct data)', async function () {
    const createVideoData = {
      title: 'Best video',
      author: 'Alex',
      availableResolutions: [AvailableResolutions.P144]
    } as CreateVideo

    const response = await request(app)
      .post(Routes.videos)
      .send(createVideoData)
      .expect(HttpStatus.CREATED)

    newVideo = response.body

    await request(app).get(Routes.videos).expect([newVideo])
  })

  it('GET video by ID with incorrect id should return 404', async () => {
    await request(app).get(`${Routes.videos}/${incorrectId}`).expect(HttpStatus.NOT_FOUND)
  })

  it('GET video by ID with correct id should return the video', async () => {
    await request(app)
      .get(`${Routes.videos}/${newVideo!.id}`)
      .expect(HttpStatus.OK, newVideo)
  })

  it('PUT video by ID with incorrect data should return 404', async () => {
    await request(app)
      .put(`${Routes.videos}/${newVideo!.id}`)
      .send({ title: 'title', author: 'title' })
      .expect(HttpStatus.BAD_REQUEST)

    const res = await request(app).get(Routes.videos)
    expect(res.body[0]).toEqual(newVideo)
  })

  it('PUT product by ID with correct data should update the video', async () => {
    await request(app)
      .put(`${Routes.videos}/${newVideo!.id}`)
      .send({
        title: 'hello title',
        author: 'hello author',
        publicationDate: '2023-01-12T08:12:39.261Z',
        canBeDownloaded: false,
      })
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app).get(Routes.videos)
    expect(res.body[0]).toEqual({
      ...newVideo,
      title: 'hello title',
      author: 'hello author',
      publicationDate: '2023-01-12T08:12:39.261Z',
      availableResolutions: [],
    })
    newVideo = res.body[0]
  })

  it('DELETE video by incorrect ID should return 404', async () => {
    await request(app)
      .delete(`${Routes.videos}/${incorrectId}`)
      .expect(HttpStatus.NOT_FOUND)

    const res = await request(app).get(Routes.videos)
    expect(res.body[0]).toEqual(newVideo)
  })
  it('DELETE product by correct ID, auth should return 204', async () => {
    await request(app)
      .delete(`${Routes.videos}/${newVideo!.id}`)
      .expect(HttpStatus.NO_CONTENT)

    const res = await request(app).get(Routes.videos)
    expect(res.body.length).toBe(0)
  })
})
