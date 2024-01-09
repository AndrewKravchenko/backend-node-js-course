import { blogCollection, postCollection } from '../../db/db'
import { OutputBlog, OutputBlogs } from '../../models/blogs/output/output'
import { Filter, ObjectId, WithId } from 'mongodb'
import { QueryBlog, QueryPostByBlogId } from '../../models/blogs/input/query'
import { OutputPosts } from '../../models/posts/output/output'
import { paginationSkip } from '../../utils/queryParams'
import { BlogDB } from '../../models/db/db'
import { PostsQueryRepository } from './posts-query-repository'

export class BlogsQueryRepository {
  static async getBlogs(query: QueryBlog): Promise<OutputBlogs> {
    const searchNameTerm = query.searchNameTerm || null
    const sortBy = query.sortBy || 'createdAt'
    const sortDirection = query.sortDirection || 'desc'
    const pageNumber = Number(query.pageNumber || 1)
    const pageSize = Number(query.pageSize || 10)

    let filter: Filter<BlogDB> = {}
    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' }
    }

    const blogs = await blogCollection
      .find(filter)
      .sort(sortBy, sortDirection)
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()

    const totalCount = await blogCollection.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs.map(this.mapDBBlogToBlogOutputModel)
    }
  }

  static async getBlogById(id: string): Promise<OutputBlog | null> {
    const blog = await blogCollection.findOne({ _id: new ObjectId(id) })

    if (!blog) {
      return null
    }

    return this.mapDBBlogToBlogOutputModel(blog)
  }

  static async getPostsByBlogId(blogId: string, query: QueryPostByBlogId): Promise<OutputPosts> {
    const sortBy = query.sortBy || 'createdAt'
    const sortDirection = query.sortDirection || 'desc'
    const pageNumber = Number(query.pageNumber || 1)
    const pageSize = Number(query.pageSize || 10)

    const posts = await postCollection
      .find({ blogId })
      .sort(sortBy, sortDirection)
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()

    const totalCount = await postCollection.countDocuments({ blogId })
    const pagesCount = Math.ceil(totalCount / pageSize)
    const items = await Promise.all(posts.map(PostsQueryRepository.mapDBPostToPostOutputModel))

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    }
  }

  static mapDBBlogToBlogOutputModel(dbBlog: WithId<BlogDB>): OutputBlog {
    return {
      id: dbBlog._id.toString(),
      name: dbBlog.name,
      description: dbBlog.description,
      websiteUrl: dbBlog.websiteUrl,
      createdAt: dbBlog.createdAt,
      isMembership: dbBlog.isMembership,
    }
  }
}