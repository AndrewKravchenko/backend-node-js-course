import 'dotenv/config'
import express, { Request, Response } from 'express'
import { videosRouter } from './routes/videos'
import { HttpStatus } from './utils'
import { Routes } from './routes/routes'
import cors from 'cors'
import { blogsRouter } from './routes/blog'
import { postsRouter } from './routes/post'
import { db } from './db/db'

export const app = express()

app.use(cors());
app.use(express.json())

app.use(Routes.videos, videosRouter)
app.use(Routes.blogs, blogsRouter)
app.use(Routes.posts, postsRouter)

app.delete(`${Routes.testing}/all-data`, (req: Request, res: Response) => {
  db.videos.length = 0
  db.posts.length = 0
  db.blogs.length = 0

  res.sendStatus(HttpStatus.NO_CONTENT)
})

