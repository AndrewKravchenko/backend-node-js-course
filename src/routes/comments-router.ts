import { Response, Router } from 'express'
import { CommentId, RequestWithBodyAndParams, RequestWithParams } from '../models/common'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '../constants/httpStatus'
import { CommentsQueryRepository } from '../repositories/query/comments-query-repository'
import { CommentsService } from '../services/comments-service'
import { bearerAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { matchedData } from 'express-validator'
import { commentValidation } from '../validators/comments-validator'
import { UpdateComment } from '../models/comments/input/update'

export const commentsRouter = Router({})

commentsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const commentId = req.params.id

  if (!ObjectId.isValid(commentId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const comment = await CommentsQueryRepository.getCommentById(commentId)

  if (comment) {
    res.send(comment)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

commentsRouter.put('/:commentId', bearerAuthMiddleware, commentValidation(), async (req: RequestWithBodyAndParams<CommentId, UpdateComment>, res: Response) => {
  const commentId = req.params.commentId

  if (!ObjectId.isValid(commentId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const updatedComment = matchedData(req) as UpdateComment
  const isUpdated = await CommentsService.updateBlog(commentId, updatedComment)

  if (isUpdated) {
    res.send(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

commentsRouter.get('/:id', bearerAuthMiddleware, async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const commentId = req.params.id

  if (!ObjectId.isValid(commentId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const isDeleted = await CommentsService.deleteComment(commentId)

  if (isDeleted) {
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})
