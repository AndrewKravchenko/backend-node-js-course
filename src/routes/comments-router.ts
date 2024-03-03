import { Response, Router } from 'express'
import { CommentId, RequestWithBodyAndParams, RequestWithParams } from '../models/common'
import { HTTP_STATUS } from '../constants/httpStatus'
import { CommentsService } from '../services/comments-service'
import { bearerAuthMiddleware, decodeUserIdFromToken } from '../middlewares/auth/auth-middleware'
import { matchedData } from 'express-validator'
import { createCommentLikeValidation, updateCommentValidation } from '../validators/comments-validator'
import { UpdateComment } from '../models/comments/input/update'
import { checkCommentOwnershipGuard } from '../middlewares/guards/comment-guard'
import { CreateLikeReq } from '../models/likes/input/create'
import { ResultCode } from '../types/resultLayer'

export const commentsRouter = Router({})

commentsRouter.get('/:commentId', decodeUserIdFromToken, async (req: RequestWithParams<CommentId>, res: Response) => {
  const comment = await CommentsService.getCommentById(req.params.commentId, req.userId)

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

commentsRouter.put('/:commentId/like-status', bearerAuthMiddleware, createCommentLikeValidation(),
  async (req: RequestWithBodyAndParams<CommentId, CreateLikeReq>, res: Response) => {
    const { likeStatus, commentId } = matchedData(req) as CreateLikeReq & CommentId
    const { resultCode } = await CommentsService.updateLikeStatus(req.userId!, commentId, likeStatus)

    if (resultCode === ResultCode.Success) {
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
