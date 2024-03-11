import { commentsModel } from '../../db/db'
import { ObjectId, WithId } from 'mongodb'
import { CommentDB, LikeStatus } from '../../models/db/db'
import { OutputComment, OutputComments } from '../../models/comments/output/output'
import { QueryComment } from '../../models/comments/input/query'
import { paginationSkip } from '../../utils/queryParams'
import { LikesService } from '../../services/likes-service'

export class CommentsQueryRepository {
  static async getCommentsByPostId(query: QueryComment, postId: string, userId?: string): Promise<OutputComments | null> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const comments = await commentsModel
      .find({ postId })
      .sort({ [sortBy]: sortDirection })
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)

    if (!comments.length) {
      return null
    }

    const totalCount = await commentsModel.countDocuments({ postId })
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: await Promise.all(comments.map(comment => this.mapDBCommentToCommentOutputModel(comment, userId)))
    }
  }

  static async getCommentById(commentId: string, userId?: string): Promise<OutputComment | null> {
    const comment = await commentsModel.findOne({ _id: new ObjectId(commentId) })

    if (!comment) {
      return null
    }

    return await this.mapDBCommentToCommentOutputModel(comment, userId)
  }

  static async mapDBCommentToCommentOutputModel(dbComment: WithId<CommentDB>, userId?: string): Promise<OutputComment> {
    const commentId = dbComment._id.toString()
    const comment: OutputComment = {
      id: commentId,
      content: dbComment.content,
      commentatorInfo: { userId: dbComment.commentatorInfo.userId, userLogin: dbComment.commentatorInfo.userLogin },
      createdAt: dbComment.createdAt,
    }

    if (dbComment.likesInfo) {
      const { likesCount, dislikesCount } = dbComment.likesInfo
      const myStatus = userId && await LikesService.getCommentLikeStatus(commentId, userId)
      comment.likesInfo = {
        likesCount,
        dislikesCount,
        myStatus: myStatus || LikeStatus.None
      }
    }

    return comment
  }
}