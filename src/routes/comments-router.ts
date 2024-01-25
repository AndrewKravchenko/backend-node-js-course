import { Response, Router } from 'express'
import { CommentId, RequestWithBodyAndParams, RequestWithParams } from '../models/common'
import { HTTP_STATUS } from '../constants/httpStatus'
import { CommentsQueryRepository } from '../repositories/query/comments-query-repository'
import { CommentsService } from '../services/comments-service'
import { bearerAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { matchedData } from 'express-validator'
import { updateCommentValidation } from '../validators/comments-validator'
import { UpdateComment } from '../models/comments/input/update'
import { checkCommentOwnershipGuard } from '../middlewares/guards/comment-guard'

export const commentsRouter = Router({})

commentsRouter.get('/:commentId', async (req: RequestWithParams<CommentId>, res: Response) => {
  const comment = await CommentsQueryRepository.getCommentById(req.params.commentId)

  if (comment) {
    res.send(comment)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

commentsRouter.put('/:commentId', bearerAuthMiddleware, checkCommentOwnershipGuard, updateCommentValidation(),
  async (req: RequestWithBodyAndParams<CommentId, UpdateComment>, res: Response) => {
    const updatedComment = matchedData(req) as UpdateComment
    const isUpdated = await CommentsService.updateComment(req.params.commentId, updatedComment)

    if (isUpdated) {
      res.send(HTTP_STATUS.NO_CONTENT)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

commentsRouter.delete('/:commentId', bearerAuthMiddleware, checkCommentOwnershipGuard,
  async (req: RequestWithParams<CommentId>, res: Response) => {
    const isDeleted = await CommentsService.deleteComment(req.params.commentId)

    if (isDeleted) {
      res.sendStatus(HTTP_STATUS.NO_CONTENT)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })
