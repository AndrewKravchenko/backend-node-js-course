import { commentCollection } from '../../db/db'
import { ObjectId, WithId } from 'mongodb'
import { CommentDB } from '../../models/db/db'
import { OutputComment, OutputComments } from '../../models/comments/output/output'
import { QueryComment } from '../../models/comments/input/query'
import { paginationSkip } from '../../utils/queryParams'

export class CommentsQueryRepository {
  static async getCommentsByPostId(query: QueryComment, postId: string): Promise<OutputComments | null> {
    const sortBy = query.sortBy || 'createdAt'
    const sortDirection = query.sortDirection || 'desc'
    const pageNumber = Number(query.pageNumber || 1)
    const pageSize = Number(query.pageSize || 10)

    const comments = await commentCollection
      .find({ postId })
      .sort(sortBy, sortDirection)
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()

    const totalCount = comments.length
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments.map(this.mapDBCommentToCommentOutputModel)
    }
  }

  static async getCommentById(commentId: string): Promise<OutputComment | null> {
    const comment = await commentCollection.findOne({ _id: new ObjectId(commentId) })

    if (!comment) {
      return null
    }

    return this.mapDBCommentToCommentOutputModel(comment)
  }

  static mapDBCommentToCommentOutputModel(dbComment: WithId<CommentDB>): OutputComment {
    return {
      id: dbComment._id.toString(),
      content: dbComment.content,
      commentatorInfo: dbComment.commentatorInfo,
      createdAt: dbComment.createdAt,
    }
  }
}