import { Request, Response, Router } from 'express'
import { AvailableResolution, CreateVideo, UpdateVideo, VideoDb } from '../types/videos'
import { RequestWithBody, RequestWithParams, Error, RequestWithBodyAndParams } from '../types/common'
import { HttpStatus, isValidString } from '../utils'

export const videos: VideoDb[] = [
  {
    id: 0,
    title: 'string',
    author: 'string',
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: '2023-12-04T16:26:14:200Z',
    publicationDate: '2023-12-04T16:26:14:200Z',
    availableResolution: [
      AvailableResolution.P144
    ],
  }
]
export const videosRouter = Router({})

const validateVideoFields = (title: string, author: string, errors: Error) => {
  if (!isValidString(title, 40)) {
    errors.errorMessages.push({ message: 'Invalid title', field: 'title' })
  }

  if (!isValidString(author, 20)) {
    errors.errorMessages.push({ message: 'Invalid author', field: 'author' })
  }
}

videosRouter.get('/', (req: Request, res: Response) => {
  res.send(videos)
})
videosRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const video = videos.find((video) => video.id === +req.params.id)

  if (!video) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.send(video)
})
videosRouter.post('/', (req: RequestWithBody<CreateVideo>, res: Response) => {
  let errors: Error = {
    errorMessages: []
  }

  let { title, author, availableResolution } = req.body

  validateVideoFields(title, author, errors)

  if (availableResolution && Array.isArray(availableResolution)) {
    availableResolution.forEach((resolution) => !Object.values(AvailableResolution).includes(resolution) && errors.errorMessages.push({
      message: 'Invalid availableResolution',
      field: 'availableResolution'
    }))
  } else {
    availableResolution = []
  }

  if (errors.errorMessages.length) {
    res.status(HttpStatus.BAD_REQUEST).send(errors)
    return
  }

  const createdAt = new Date()
  const publicationDate = new Date()

  publicationDate.setDate(createdAt.getDate() + 1)

  const newVideo: VideoDb = {
    id: +(new Date()),
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: createdAt.toISOString(),
    publicationDate: publicationDate.toISOString(),
    title,
    author,
    availableResolution
  }

  videos.push(newVideo)
  res.status(HttpStatus.CREATED).send(newVideo)
})
videosRouter.put('/:id', (req: RequestWithBodyAndParams<{ id: string }, UpdateVideo>, res: Response) => {
  let errors: Error = {
    errorMessages: []
  }

  let { title, author, availableResolution, canBeDownloaded, minAgeRestriction, publicationDate } = req.body

  validateVideoFields(title, author, errors)

  if (Array.isArray(availableResolution)) {
    availableResolution.forEach((resolution) => !Object.values(AvailableResolution).includes(resolution) && errors.errorMessages.push({
      message: 'Invalid availableResolution',
      field: 'availableResolution'
    }))
  } else {
    availableResolution = []
  }

  if (typeof canBeDownloaded !== 'boolean') {
    canBeDownloaded = false
  }

  if (typeof minAgeRestriction === 'number') {
    minAgeRestriction < 1 || minAgeRestriction > 18 && errors.errorMessages.push({
      message: 'Invalid minAgeRestriction',
      field: 'minAgeRestriction'
    })
  } else {
    minAgeRestriction = null
  }

  if (errors.errorMessages.length) {
    res.status(HttpStatus.BAD_REQUEST).send(errors)
    return
  }

  const videoIndex = videos.findIndex((video) => video.id === +req.params.id)

  if (videoIndex === -1) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const video = videos[videoIndex]
  const updatedVideo: VideoDb = {
    ...video,
    canBeDownloaded,
    minAgeRestriction,
    title,
    author,
    availableResolution,
    publicationDate: publicationDate ?? video.publicationDate,
  }

  videos.splice(videoIndex, 1, updatedVideo)
  res.sendStatus(HttpStatus.NO_CONTENT)
})
videosRouter.delete('/:id', (req: Request, res: Response) => {
  for (let i = 0; i < videos.length; i++) {
    if (videos[i].id === +req.params.id) {
      videos.splice(i, 1)
      res.sendStatus(HttpStatus.NO_CONTENT)
      return
    }
  }

  res.sendStatus(HttpStatus.NOT_FOUND)
})
