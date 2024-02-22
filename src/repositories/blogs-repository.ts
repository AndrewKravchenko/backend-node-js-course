import { blogsModel } from '../db/db'
import { ObjectId } from 'mongodb'
import { UpdateBlog } from '../models/blogs/input/update'
import { ExtendedCreateBlog } from '../models/blogs/input/create'

export class BlogsRepository {
  static async createBlog(newBlog: ExtendedCreateBlog): Promise<string> {
    const { _id } = await blogsModel.create(newBlog)

    return _id.toString()
  }

  static async updateBlog(blogId: string, updatedBlog: UpdateBlog): Promise<boolean> {
    const result = await blogsModel.updateOne(
      { _id: new ObjectId(blogId) },
      { $set: updatedBlog }
    )

    return !!result.matchedCount
  }

  static async deleteBlog(blogId: string): Promise<boolean> {
    const result = await blogsModel.deleteOne({ _id: new ObjectId(blogId) })

    return !!result.deletedCount
  }
}