import { postsModel } from '../../db/db'
import { ObjectId, WithId } from 'mongodb'
import { OutputPostDB, OutputPostsDB } from '../../models/posts/output/output'
import { paginationSkip } from '../../utils/queryParams'
import { PostDB } from '../../models/db/db'
import { PostQuery } from '../../models/posts/input/query'
import { QueryPostByBlogId } from '../../models/blogs/input/query'

export class PostsQueryRepository {
  static async getPosts({ sortBy, sortDirection, pageNumber, pageSize }: PostQuery): Promise<OutputPostsDB> {
    const posts = await postsModel
      .find({})
      .sort({ [sortBy]: sortDirection })
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)

    const totalCount = await postsModel.countDocuments({})
    const pagesCount = Math.ceil(totalCount / pageSize)
    const items = await Promise.all(posts.map(this.mapDBPostToPostOutputModel))

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    }
  }

  static async getPostsByBlogId(blogId: string, query: QueryPostByBlogId): Promise<OutputPostsDB> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const posts = await postsModel
      .find({ blogId })
      .sort({ [sortBy]: sortDirection })
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)

    const totalCount = await postsModel.countDocuments({ blogId })
    const pagesCount = Math.ceil(totalCount / pageSize)
    const items = await Promise.all(posts.map(this.mapDBPostToPostOutputModel))

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    }
  }

  static async getPostById(postId: string): Promise<OutputPostDB | null> {
    const post = await postsModel.findOne({ _id: new ObjectId(postId) })

    if (!post) {
      return null
    }

    return this.mapDBPostToPostOutputModel(post)
  }

  static mapDBPostToPostOutputModel(dbPost: WithId<PostDB>): OutputPostDB {
    return {
      id: dbPost._id.toString(),
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName:dbPost.blogName,
      extendedLikesInfo: dbPost.extendedLikesInfo,
      createdAt: dbPost.createdAt,
    }
  }
}