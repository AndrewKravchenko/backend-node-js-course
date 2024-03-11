import { Response, Router } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'
import {
  PostId,
  RequestWithBody,
  RequestWithBodyAndParams,
  RequestWithParams,
  RequestWithQuery,
  RequestWithQueryAndParams
} from '../models/common'
import { basicAuthMiddleware, bearerAuthMiddleware, decodeUserIdFromToken } from '../middlewares/auth/auth-middleware'
import { createPostLikeValidation, postsGetValidation, postValidation } from '../validators/posts-validator'
import { CreateCommentToPost, CreatePost } from '../models/posts/input/create'
import { UpdatePost } from '../models/posts/input/update'
import { PostQuery } from '../models/posts/input/query'
import { matchedData } from 'express-validator'
import { PostService } from '../services/posts-service'
import { QueryComment } from '../models/comments/input/query'
import { commentsByPostIdValidation, commentToPostValidation } from '../validators/comments-validator'
import { CreateLikeReq } from '../models/likes/input/create'
import { ResultCode } from '../types/resultLayer'

export const postsRouter = Router({})

postsRouter.get('/', postsGetValidation(), decodeUserIdFromToken, async (req: RequestWithQuery<Partial<PostQuery>>, res: Response) => {
  const query = matchedData(req, { locations: ['query'] }) as PostQuery
  const posts = await PostService.getPosts(query, req.userId)

  res.send(posts)
})

postsRouter.get('/:postId', decodeUserIdFromToken, async (req: RequestWithParams<PostId>, res: Response) => {
  const post = await PostService.getPostById(req.params.postId, req.userId)

  if (post) {
    res.send(post)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

postsRouter.get('/:postId/comments', commentsByPostIdValidation(), decodeUserIdFromToken, async (req: RequestWithQueryAndParams<PostId, PostQuery>, res: Response) => {
  const query = matchedData(req, { locations: ['query'] }) as QueryComment
  const postComments = await PostService.getCommentsByPostId(query, req.params.postId, req.userId)

  if (postComments) {
    res.send(postComments)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

postsRouter.post('/:postId/comments', bearerAuthMiddleware, commentToPostValidation(),
  async (req: RequestWithBodyAndParams<PostId, CreateCommentToPost>, res: Response) => {
    const commentData = matchedData(req, { locations: ['params', 'body'] }) as CreateCommentToPost & PostId
    const comment = await PostService.createCommentToPost(commentData, req.userId!)

    if (comment) {
      res.status(HTTP_STATUS.CREATED).send(comment)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

postsRouter.post('/', basicAuthMiddleware, postValidation(), async (req: RequestWithBody<CreatePost>, res: Response) => {
  const newPost = matchedData(req) as CreatePost
  const createdPost = await PostService.createPost(newPost)

  if (createdPost) {
    res.status(HTTP_STATUS.CREATED).send(createdPost)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

postsRouter.put('/:postId', basicAuthMiddleware, postValidation(), async (req: RequestWithBodyAndParams<PostId, UpdatePost>, res: Response) => {
  const updatedPost = matchedData(req) as UpdatePost
  const isUpdated = await PostService.updatePost(req.params.postId, updatedPost)

  if (isUpdated) {
    res.send(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

postsRouter.put('/:postId/like-status', bearerAuthMiddleware, createPostLikeValidation(),
  async (req: RequestWithBodyAndParams<PostId, CreateLikeReq>, res: Response) => {
    const { likeStatus, postId } = matchedData(req) as CreateLikeReq & PostId
    const { resultCode } = await PostService.updateLikeStatus(req.userId!, postId, likeStatus)

    if (resultCode === ResultCode.Success) {
      res.send(HTTP_STATUS.NO_CONTENT)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

postsRouter.delete('/:postId', basicAuthMiddleware, async (req: RequestWithParams<PostId>, res: Response) => {
  const isDeleted = await PostService.deletePost(req.params.postId)

  if (isDeleted) {
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})
