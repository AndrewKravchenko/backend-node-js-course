import { Request, Response, Router } from 'express'
import { PostRepository } from '../repositories/post'
import { HttpStatus } from '../utils'
import { RequestWithBody, RequestWithBodyAndParams, RequestWithParams } from '../models/common'
import { authMiddleware } from '../middlewares/auth/auth'
import { BlogRepository } from '../repositories/blog'
import { postValidation } from '../validators/post'
import { randomUUID } from 'node:crypto'
import { CreatePost, UpdatePost } from '../models/posts/input'
import { Post } from '../models/posts/output'

export const postsRouter = Router({})

postsRouter.get('/', (req: Request, res: Response) => {
  const posts = PostRepository.getAllPosts()

  res.send(posts)
})

postsRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const id = req.params.id
  const post = PostRepository.getPostById(id)

  if (!post) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.send(post)
})

postsRouter.post('/', authMiddleware, postValidation(), (req: RequestWithBody<CreatePost>, res: Response) => {
  const { title, shortDescription, content, blogId } = req.body
  const blog = BlogRepository.getBlogById(blogId)

  if (!blog) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const newPost: Post = { id: randomUUID(), title, shortDescription, content, blogId, blogName: blog.name }

  PostRepository.createPost(newPost)
  res.status(HttpStatus.CREATED).send(newPost)
})

postsRouter.put('/:id', authMiddleware, postValidation(), (req: RequestWithBodyAndParams<UpdatePost>, res: Response) => {
  const isUpdated = PostRepository.updatePost(req.params.id, req.body)

  if (isUpdated) {
    res.send(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})

postsRouter.delete('/:id', authMiddleware, (req: RequestWithParams<{ id: string }>, res: Response) => {
  const isDeleted = PostRepository.deletePost(req.params.id)

  if (isDeleted) {
    res.sendStatus(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }})
