import { Request, Response, Router } from 'express'
import { RequestWithBody, RequestWithParams, Error, RequestWithBodyAndParams } from '../models/common'
import { HttpStatus, isValidString } from '../utils'
import { Video } from '../models/videos/output'
import { AvailableResolutions, CreateVideo, UpdateVideo } from '../models/videos/input'
import { db } from '../db/db'

const TITLE_MAX_LENGTH = 40;
const AUTHOR_MAX_LENGTH = 20;

export const videosRouter = Router({})

const validateVideoFields = (title: string, author: string, errors: Error) => {
  if (!isValidString(title, TITLE_MAX_LENGTH)) {
    errors.errorsMessages.push({ message: 'Invalid title', field: 'title' })
  }

  if (!isValidString(author, AUTHOR_MAX_LENGTH)) {
    errors.errorsMessages.push({ message: 'Invalid author', field: 'author' })
  }
}

videosRouter.get('/', (req: Request, res: Response) => {
  res.send(db.videos)
})
videosRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const video = db.videos.find((video) => video.id === +req.params.id)

  if (!video) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.send(video)
})
videosRouter.post('/', (req: RequestWithBody<CreateVideo>, res: Response) => {
  let errors: Error = {
    errorsMessages: []
  }

  let { title, author, availableResolutions } = req.body

  validateVideoFields(title, author, errors)

  if (Array.isArray(availableResolutions)) {
    availableResolutions.forEach((resolution) => !Object.values(AvailableResolutions).includes(resolution) && errors.errorsMessages.push({
      message: 'Invalid availableResolutions',
      field: 'availableResolutions'
    }))
  } else {
    availableResolutions = []
  }

  if (errors.errorsMessages.length) {
    res.status(HttpStatus.BAD_REQUEST).send(errors)
    return
  }

  const createdAt = new Date()
  const publicationDate = new Date()

  publicationDate.setDate(createdAt.getDate() + 1)

  const newVideo: Video = {
    id: +(new Date()),
    canBeDownloaded: false,
    minAgeRestriction: null,
    createdAt: createdAt.toISOString(),
    publicationDate: publicationDate.toISOString(),
    title: title.trim(),
    author: author.trim(),
    availableResolutions
  }

  db.videos.push(newVideo)
  res.status(HttpStatus.CREATED).send(newVideo)
})
videosRouter.put('/:id', (req: RequestWithBodyAndParams<UpdateVideo>, res: Response) => {
  let errors: Error = {
    errorsMessages: []
  }

  let { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate } = req.body

  validateVideoFields(title, author, errors)

  if (Array.isArray(availableResolutions)) {
    availableResolutions.forEach((resolution) => !Object.values(AvailableResolutions).includes(resolution) && errors.errorsMessages.push({
      message: 'Invalid availableResolutions',
      field: 'availableResolutions'
    }))
  } else {
    availableResolutions = []
  }

  if (typeof canBeDownloaded !== 'boolean') {
    errors.errorsMessages.push({
      message: 'Invalid canBeDownloaded',
      field: 'canBeDownloaded'
    })
  }

  if (typeof minAgeRestriction === 'number') {
    minAgeRestriction < 1 || minAgeRestriction > 18 && errors.errorsMessages.push({
      message: 'Invalid minAgeRestriction',
      field: 'minAgeRestriction'
    })
  } else {
    minAgeRestriction = null
  }

  if (publicationDate) {
    const parsedDate = Date.parse(publicationDate)
    if (isNaN(parsedDate) || new Date(parsedDate).toISOString() !== publicationDate) {
      errors.errorsMessages.push({
        message: 'Invalid publicationDate',
        field: 'publicationDate'
      })
    }
  }

  if (errors.errorsMessages.length) {
    res.status(HttpStatus.BAD_REQUEST).send(errors)
    return
  }

  const videoIndex = db.videos.findIndex((video) => video.id === +req.params.id)

  if (videoIndex === -1) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const video = db.videos[videoIndex]
  const updatedVideo: Video = {
    ...video,
    canBeDownloaded,
    minAgeRestriction,
    title: title.trim(),
    author: author.trim(),
    availableResolutions,
    publicationDate: publicationDate ?? video.publicationDate,
  }

  db.videos.splice(videoIndex, 1, updatedVideo)
  res.sendStatus(HttpStatus.NO_CONTENT)
})
videosRouter.delete('/:id', (req: Request, res: Response) => {
  const videos = db.videos
  for (let i = 0; i < videos.length; i++) {
    if (videos[i].id === +req.params.id) {
      videos.splice(i, 1)
      res.sendStatus(HttpStatus.NO_CONTENT)
      return
    }
  }

  res.sendStatus(HttpStatus.NOT_FOUND)
})
