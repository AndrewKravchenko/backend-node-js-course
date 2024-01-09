import { Response, Router } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'
import {
  PostId,
  RequestWithBody,
  RequestWithBodyAndParams,
  RequestWithParams,
  RequestWithQuery, RequestWithQueryAndParams
} from '../models/common'
import { basicAuthMiddleware, bearerAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { commentToBlogValidation, postValidation } from '../validators/posts-validator'
import { CreateCommentToPost, CreatePost } from '../models/posts/input/create'
import { UpdatePost } from '../models/posts/input/update'
import { ObjectId } from 'mongodb'
import { QueryPost } from '../models/posts/input/query'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { PostsQueryRepository } from '../repositories/query/posts-query-repository'
import { matchedData } from 'express-validator'
import { PostService } from '../services/posts-service'
import { CommentsQueryRepository } from '../repositories/query/comments-query-repository'
import { QueryComment } from '../models/comments/input/query'

export const postsRouter = Router({})

postsRouter.get('/', async (req: RequestWithQuery<QueryPost>, res: Response) => {
  const query = matchedData(req, { locations: ['query'] }) as QueryPost
  const posts = await PostsQueryRepository.getPosts(query)

  res.send(posts)
})

postsRouter.get('/:postId', async (req: RequestWithParams<PostId>, res: Response) => {
  const postId = req.params.postId

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

postsRouter.get('/:postId/comments', async (req: RequestWithQueryAndParams<PostId, QueryPost>, res: Response) => {
  const postId = req.params.postId
  const query = matchedData(req, { locations: ['query'] }) as QueryComment

  if (!ObjectId.isValid(postId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const post = await CommentsQueryRepository.getCommentsByPostId(query, postId)

  if (!post) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  res.send(post)
})

postsRouter.post('/:postId/comments', bearerAuthMiddleware, commentToBlogValidation,
  async (req: RequestWithBodyAndParams<PostId, CreateCommentToPost>, res: Response) => {
    const userId = req.userId

    if (!userId) {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
      return
    }

    const postId = req.params.postId
    const commentData = matchedData(req, { locations: ['params', 'body'] }) as CreateCommentToPost & PostId

    if (!ObjectId.isValid(postId)) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
      return
    }

    const post = await PostService.createCommentToPost(commentData, userId)

    if (!post) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
      return
    }

    res.send(post)
  })

postsRouter.post('/', basicAuthMiddleware, postValidation(), async (req: RequestWithBody<CreatePost>, res: Response) => {
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

postsRouter.put('/:postId', basicAuthMiddleware, postValidation(), async (req: RequestWithBodyAndParams<PostId, UpdatePost>, res: Response) => {
  const postId = req.params.postId

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

postsRouter.delete('/:postId', basicAuthMiddleware, async (req: RequestWithParams<PostId>, res: Response) => {
  const postId = req.params.postId

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
