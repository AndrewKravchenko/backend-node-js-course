import { Response, Router } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'
import { RequestWithBody, RequestWithBodyAndParams, RequestWithParams, RequestWithQuery } from '../models/common'
import { authMiddleware } from '../middlewares/auth/auth-middleware'
import { postValidation } from '../validators/posts-validator'
import { CreatePost } from '../models/posts/input/create'
import { UpdatePost } from '../models/posts/input/update'
import { ObjectId } from 'mongodb'
import { QueryPost } from '../models/posts/input/query'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { PostsQueryRepository } from '../repositories/query/posts-query-repository'
import { matchedData } from 'express-validator'
import { PostService } from '../services/posts-service'

export const postsRouter = Router({})

postsRouter.get('/', async (req: RequestWithQuery<QueryPost>, res: Response) => {
  const query = matchedData(req, {locations: ['query']}) as QueryPost
  const posts = await PostsQueryRepository.getPosts(query)

  res.send(posts)
})

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const postId = req.params.id

  if (!ObjectId.isValid(postId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const post = await PostsQueryRepository.getPostById(postId)

  if (!post) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  res.send(post)
})

postsRouter.post('/', authMiddleware, postValidation(), async (req: RequestWithBody<CreatePost>, res: Response) => {
  const newPost = matchedData(req) as CreatePost
  const blog = await BlogsQueryRepository.getBlogById(newPost.blogId)

  if (!blog) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const createdPostId = await PostService.createPost(newPost)
  const createdPost = await PostsQueryRepository.getPostById(createdPostId)

  if (!createdPost) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  res.status(HTTP_STATUS.CREATED).send(createdPost)
})

postsRouter.put('/:id', authMiddleware, postValidation(), async (req: RequestWithBodyAndParams<UpdatePost>, res: Response) => {
  const postId = req.params.id

  if (!ObjectId.isValid(postId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const updatedPost = matchedData(req) as UpdatePost
  const isUpdated = await PostService.updatePost(postId, updatedPost)

  if (isUpdated) {
    res.send(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

postsRouter.delete('/:id', authMiddleware, async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const postId = req.params.id

  if (!ObjectId.isValid(postId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const isDeleted = await PostService.deletePost(postId)

  if (isDeleted) {
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})
