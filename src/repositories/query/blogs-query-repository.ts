import { blogsModel, postsModel } from '../../db/db'
import { OutputBlog, OutputBlogs } from '../../models/blogs/output/output'
import { ObjectId, WithId } from 'mongodb'
import { QueryBlog, QueryPostByBlogId } from '../../models/blogs/input/query'
import { OutputPosts } from '../../models/posts/output/output'
import { paginationSkip } from '../../utils/queryParams'
import { BlogDB } from '../../models/db/db'
import { PostsQueryRepository } from './posts-query-repository'
import { FilterQuery } from 'mongoose'

export class BlogsQueryRepository {
  static async getBlogs({
    searchNameTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize
  }: QueryBlog): Promise<OutputBlogs> {
    let filter: FilterQuery<BlogDB> = {}
    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' }
    }

    const blogs = await blogsModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)

    const totalCount = await blogsModel.countDocuments(filter)
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
    const blog = await blogsModel.findOne({ _id: new ObjectId(id) })

    if (!blog) {
      return null
    }

    return this.mapDBBlogToBlogOutputModel(blog)
  }

  static async getPostsByBlogId(blogId: string, query: QueryPostByBlogId): Promise<OutputPosts> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const posts = await postsModel
      .find({ blogId })
      .sort({ [sortBy]: sortDirection })
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)

    const totalCount = await postsModel.countDocuments({ blogId })
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