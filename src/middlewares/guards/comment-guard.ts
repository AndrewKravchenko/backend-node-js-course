import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '../../constants/httpStatus'
import { CommentsQueryRepository } from '../../repositories/query/comments-query-repository'
import { CommentId } from '../../models/common'
import { ObjectId } from 'mongodb'

export const checkCommentOwnershipGuard = async (req: Request<CommentId>, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId

  if (!ObjectId.isValid(commentId)) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  const comment = await CommentsQueryRepository.getCommentById(commentId)

  if (!comment) {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
    return
  }

  if (comment.commentatorInfo.userId !== req.userId) {
    res.sendStatus(HTTP_STATUS.FORBIDDEN)
    return
  }

  return next()
}