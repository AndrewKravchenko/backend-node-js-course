import 'dotenv/config'
import express, { Request, Response } from 'express'
import { videos, videosRouter } from './routes/videos'
import { HttpStatus } from './utils'
import { Routes } from './routes/routes'
import cors from 'cors';

export const app = express()

app.use(cors());
app.use(express.json())

app.use(Routes.videos, videosRouter)
app.delete(`${Routes.testing}/all-data`, (req: Request, res: Response) => {
  videos.length = 0

  res.sendStatus(HttpStatus.NO_CONTENT)
})

