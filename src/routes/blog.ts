import { Request, Response, Router } from 'express'
import { BlogRepository } from '../repositories/blog'
import { RequestWithBody, RequestWithBodyAndParams, RequestWithParams } from '../models/common'
import { HttpStatus } from '../utils'
import { authMiddleware } from '../middlewares/auth/auth'
import { blogValidation } from '../validators/blog'
import { CreateBlog, UpdateBlog } from '../models/blogs/input'
import { Blog } from '../models/blogs/output'
import { randomUUID } from 'node:crypto'
import { postValidation } from '../validators/post'

export const blogsRouter = Router({})

blogsRouter.get('/', (req: Request, res: Response) => {
  const blogs = BlogRepository.getAllBlogs()

  res.send(blogs)
})

blogsRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const id = req.params.id
  const blog = BlogRepository.getBlogById(id)

  if(!blog) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.send(blog)
})

blogsRouter.post('/', authMiddleware, blogValidation(), (req: RequestWithBody<CreateBlog>, res: Response) => {
  const { name, description, websiteUrl } = req.body
  console.log(req.body)
  const newBlog: Blog = { id: randomUUID(), name, description, websiteUrl }
  console.log(newBlog)
  BlogRepository.createBlog(newBlog)
  res.status(HttpStatus.CREATED).send(newBlog)
})

blogsRouter.put('/:id', authMiddleware, blogValidation(), (req: RequestWithBodyAndParams<UpdateBlog>, res: Response) => {
  const isUpdated = BlogRepository.updateBlog(req.params.id, req.body)

  if (isUpdated) {
    res.send(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})

blogsRouter.delete('/:id', authMiddleware, (req: RequestWithParams<{ id: string }>, res: Response) => {
  const isDeleted = BlogRepository.deleteBlog(req.params.id)

  if (isDeleted) {
    res.sendStatus(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})