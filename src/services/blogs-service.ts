import { UpdateBlog } from '../models/blogs/input/update'
import { CreateBlog, ExtendedCreateBlog } from '../models/blogs/input/create'
import { BlogsRepository } from '../repositories/blogs-repository'

export class BlogService {
  static async createBlog(blogData: CreateBlog): Promise<string> {
    const newBlog: ExtendedCreateBlog = {
      name: blogData.name,
      description: blogData.description,
      websiteUrl: blogData.websiteUrl,
      isMembership: false,
      createdAt: new Date().toISOString(),
    }

    return await BlogsRepository.createBlog(newBlog)
  }

  static async updateBlog(blogId: string, updatedBlog: UpdateBlog): Promise<boolean> {
    return await BlogsRepository.updateBlog(blogId, updatedBlog)
  }

  static async deleteBlog(blogId: string): Promise<boolean> {
    return await BlogsRepository.deleteBlog(blogId)
  }
}