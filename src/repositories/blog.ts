import { blogCollection, postCollection } from '../db/db'
import { OutputBlog, OutputBlogs } from '../models/blogs/output/output'
import { blogMapper } from '../models/blogs/mappers/mapper'
import { ObjectId } from 'mongodb'
import { UpdateBlog } from '../models/blogs/input/update'
import { ExtendedCreateBlog } from '../models/blogs/input/create'
import { QueryBlog, QueryPostByBlogID } from '../models/blogs/input/query'
import { postMapper } from '../models/posts/mappers/mapper'
import { OutputPosts } from '../models/posts/output/output'
import { paginationSkip } from '../utils/queryParams'

export class BlogRepository {
  static async getAllBlogs(sortData: QueryBlog): Promise<OutputBlogs> {
    const searchNameTerm = sortData.searchNameTerm || null
    const sortBy = sortData.sortBy || 'createdAt'
    const sortDirection = sortData.sortDirection || 'desc'
    const pageNumber = Number(sortData.pageNumber || 1)
    const pageSize = Number(sortData.pageSize || 10)

    let filter = {}
    if (searchNameTerm) {
      filter = {
        name: { $regex: searchNameTerm, $options: 'i' }
      }
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
      items: blogs.map(blogMapper)
    }
  }

  static async getPostsByBlogId(blogId: string, sortData: QueryPostByBlogID): Promise<OutputPosts> {
    const sortBy = sortData.sortBy || 'createdAt'
    const sortDirection = sortData.sortDirection || 'desc'
    const pageNumber = Number(sortData.pageNumber || 1)
    const pageSize = Number(sortData.pageSize || 10)

    const posts = await postCollection
      .find({ blogId })
      .sort(sortBy, sortDirection)
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()

    const totalCount = await postCollection.countDocuments({ blogId })
    const pagesCount = Math.ceil(totalCount / pageSize)

      return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.map(postMapper)
    }
  }

  static async getBlogById(id: string): Promise<OutputBlog | null> {
    const blog = await blogCollection.findOne({ _id: new ObjectId(id) })

    if (!blog) {
      return null
    }

    return blogMapper(blog)
  }

  static async createBlog(newBlog: ExtendedCreateBlog): Promise<string> {
    const { insertedId } = await blogCollection.insertOne(newBlog)

    return insertedId.toString()
  }

  static async updateBlog(id: string, updatedBlogData: UpdateBlog): Promise<boolean> {
    const result = await blogCollection.updateOne({ _id: new ObjectId(id) }, {
      $set: updatedBlogData
    })

    return !!result.matchedCount
  }

  static async deleteBlog(id: string): Promise<boolean> {
    const result = await blogCollection.deleteOne({ _id: new ObjectId(id) })

    return !!result.deletedCount
  }
}