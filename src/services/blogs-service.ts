import { UpdateBlog } from '../models/blogs/input/update'
import { CreateBlog, ExtendedCreateBlog } from '../models/blogs/input/create'
import { BlogsRepository } from '../repositories/blogs-repository'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { OutputBlog } from '../models/blogs/output/output'
import { QueryPostByBlogId } from '../models/blogs/input/query'
import { OutputPost, OutputPosts } from '../models/posts/output/output'
import { ObjectId } from 'mongodb'
import { CreatePost } from '../models/posts/input/create'
import { PostService } from './posts-service'

export class BlogService {
  static async getBlogById(blogId: string): Promise<OutputBlog | null> {
    if (ObjectId.isValid(blogId)) {
      return await BlogsQueryRepository.getBlogById(blogId)
    }

    return null
  }

  static async getPostsByBlogId(blogId: string, query: QueryPostByBlogId): Promise<OutputPosts | null> {
    const blog = await this.getBlogById(blogId)

    if (!blog) {
      return null
    }

    return await BlogsQueryRepository.getPostsByBlogId(blogId, query)
  }

  static async createBlog(blogData: CreateBlog): Promise<OutputBlog | null> {
    const newBlog: ExtendedCreateBlog = {
      name: blogData.name,
      description: blogData.description,
      websiteUrl: blogData.websiteUrl,
      isMembership: false,
      createdAt: new Date().toISOString(),
    }

    const blogId = await BlogsRepository.createBlog(newBlog)

    return await BlogsQueryRepository.getBlogById(blogId)
  }

  static async createPostToBlog(blogId: string, newPost: CreatePost): Promise<OutputPost | null> {
    const blog = await this.getBlogById(blogId)

    if (!blog) {
      return null
    }

    return await PostService.createPost(newPost)
  }

  static async updateBlog(blogId: string, updatedBlog: UpdateBlog): Promise<boolean> {
    const blog = await this.getBlogById(blogId)

    if (!blog) {
      return false
    }

    return await BlogsRepository.updateBlog(blogId, updatedBlog)
  }

  static async deleteBlog(blogId: string): Promise<boolean> {
    const blog = await this.getBlogById(blogId)

    if (!blog) {
      return false
    }

    return await BlogsRepository.deleteBlog(blogId)
  }
}