import 'dotenv/config'
import express from 'express'
import { paths } from '../constants/paths'
import cors from 'cors'
import { blogsRouter } from './routes/blog'
import { postsRouter } from './routes/post'
import { deleteAllDataRoute } from './routes/testing'
import { usersRouter } from './routes/user'
import { authRouter } from './routes/auth'

export const app = express()

app.use(cors())
app.use(express.json())

app.use(paths.blogs, blogsRouter)
app.use(paths.posts, postsRouter)
app.use(paths.users, usersRouter)
app.use(paths.auth, authRouter)
app.use(paths.testing, deleteAllDataRoute)
