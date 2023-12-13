import express from 'express'
import { videosRouter } from './routes/videos'
import { Routes } from './routes/routes'

export const app = express()

app.use(express.json())

app.use(Routes.videos, videosRouter)

