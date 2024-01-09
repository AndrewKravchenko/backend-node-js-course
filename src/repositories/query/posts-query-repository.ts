import { postCollection } from '../../db/db'
import { ObjectId, WithId } from 'mongodb'
import { OutputPost, OutputPosts } from '../../models/posts/output/output'
import { paginationSkip } from '../../utils/queryParams'
import { PostDB } from '../../models/db/db'
import { QueryPost } from '../../models/posts/input/query'
import { BlogsQueryRepository } from './blogs-query-repository'

export class PostsQueryRepository {
  static async getPosts(query: QueryPost): Promise<OutputPosts> {
    const sortBy = query.sortBy || 'createdAt'
    const sortDirection = query.sortDirection || 'desc'
    const pageNumber = Number(query.pageNumber || 1)
    const pageSize = Number(query.pageSize || 10)

    const posts = await postCollection
      .find({})
      .sort(sortBy, sortDirection)
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()

    const totalCount = await postCollection.countDocuments({})
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

  static async getPostById(postId: string): Promise<OutputPost | null> {
    const post = await postCollection.findOne({ _id: new ObjectId(postId) })

    if (!post) {
      return null
    }

    return this.mapDBPostToPostOutputModel(post)
  }

  static async mapDBPostToPostOutputModel(dbPost: WithId<PostDB>): Promise<OutputPost> {
    const blog = await BlogsQueryRepository.getBlogById(dbPost.blogId)

    return {
      id: dbPost._id.toString(),
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: blog!.name,
      createdAt: dbPost.createdAt,
    }
  }
}