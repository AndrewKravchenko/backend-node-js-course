import 'dotenv/config'
import express from 'express'
import { PATHS } from './constants/paths'
import cors from 'cors'
import { blogsRouter } from './routes/blogs-router'
import { postsRouter } from './routes/posts-router'
import { deleteAllDataRoute } from './routes/testing-router'
import { usersRouter } from './routes/users-router'
import { authRouter } from './routes/auth-router'
import { commentsRouter } from './routes/comments-router'

export const app = express()

app.use(cors())
app.use(express.json())

app.use(PATHS.blogs, blogsRouter)
app.use(PATHS.posts, postsRouter)
app.use(PATHS.users, usersRouter)
app.use(PATHS.comments, commentsRouter)
app.use(PATHS.auth, authRouter)
app.use(PATHS.testing, deleteAllDataRoute)
