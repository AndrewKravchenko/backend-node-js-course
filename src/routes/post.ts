import { Response, Router } from 'express'
import { PostRepository } from '../repositories/post'
import { HttpStatus } from '../../constants/httpStatus'
import { RequestWithBody, RequestWithBodyAndParams, RequestWithParams, RequestWithQuery } from '../models/common'
import { authMiddleware } from '../middlewares/auth/auth'
import { BlogRepository } from '../repositories/blog'
import { postValidation } from '../validators/post'
import { CreatePost, ExtendedCreatePost } from '../models/posts/input/create'
import { UpdatePost } from '../models/posts/input/update'
import { ObjectId } from 'mongodb'
import { QueryPost } from '../models/posts/input/query'

export const postsRouter = Router({})

postsRouter.get('/', async (req: RequestWithQuery<QueryPost>, res: Response) => {
  const { pageSize, pageNumber, sortDirection, sortBy} = req.query
  const sortData = {
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }

  const posts = await PostRepository.getAllPosts(sortData)

  res.send(posts)
})

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const post = await PostRepository.getPostById(id)

  if (!post) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.send(post)
})

postsRouter.post('/', authMiddleware, postValidation(), async (req: RequestWithBody<CreatePost>, res: Response) => {
  const { title, shortDescription, content, blogId } = req.body
  const blog = await BlogRepository.getBlogById(blogId)

  if (!blog) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const newPost: ExtendedCreatePost = {
    title,
    blogId,
    content,
    shortDescription,
    blogName: blog.name,
    createdAt: new Date().toISOString()
  }

  const createdPostId = await PostRepository.createPost(newPost)
  const createdPost = await PostRepository.getPostById(createdPostId)

  if (!createdPostId) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.status(HttpStatus.CREATED).send(createdPost)
})

postsRouter.put('/:id', authMiddleware, postValidation(), async (req: RequestWithBodyAndParams<UpdatePost>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const { title, content, blogId, shortDescription } = req.body
  const updatedPostData = {
    title,
    content,
    blogId,
    shortDescription
  }

  const isUpdated = await PostRepository.updatePost(id, updatedPostData)

  if (isUpdated) {
    res.send(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})

postsRouter.delete('/:id', authMiddleware, async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const isDeleted = await PostRepository.deletePost(id)

  if (isDeleted) {
    res.sendStatus(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})
