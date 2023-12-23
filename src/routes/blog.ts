import { Request, Response, Router } from 'express'
import { BlogRepository } from '../repositories/blog'
import { RequestWithBody, RequestWithBodyAndParams, RequestWithParams } from '../models/common'
import { HttpStatus } from '../utils'
import { authMiddleware } from '../middlewares/auth/auth'
import { blogValidation } from '../validators/blog'
import { ObjectId } from 'mongodb'
import { CreateBlog, ExtendedCreateBlog } from '../models/blogs/input/create'
import { UpdateBlog } from '../models/blogs/input/update'

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: Request, res: Response) => {
  const blogs = await BlogRepository.getAllBlogs()

  res.send(blogs)
})

blogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const blog = await BlogRepository.getBlogById(id)

  if (!blog) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.send(blog)
})

blogsRouter.post('/', authMiddleware, blogValidation(), async (req: RequestWithBody<CreateBlog>, res: Response) => {
  const { name, description, websiteUrl } = req.body
  const newBlog: ExtendedCreateBlog = {
    name,
    description,
    websiteUrl,
    isMembership: false,
    createdAt: new Date().toISOString(),
  }

  const blogId = await BlogRepository.createBlog(newBlog)
  const createdBlog = await BlogRepository.getBlogById(blogId)

  res.status(HttpStatus.CREATED).send(createdBlog)
})

blogsRouter.put('/:id', authMiddleware, blogValidation(), async (req: RequestWithBodyAndParams<UpdateBlog>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const { name, description, websiteUrl } = req.body
  const updatedBlogData = {
    name,
    description,
    websiteUrl
  }

  const isUpdated = await BlogRepository.updateBlog(id, updatedBlogData)

  if (isUpdated) {
    res.send(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})

blogsRouter.delete('/:id', authMiddleware, async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const isDeleted = await BlogRepository.deleteBlog(id)

  if (isDeleted) {
    res.sendStatus(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})