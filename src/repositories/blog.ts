import { blogCollection } from '../db/db'
import { OutputBlog } from '../models/blogs/output/output'
import { blogMapper } from '../models/blogs/mappers/mapper'
import { ObjectId } from 'mongodb'
import { UpdateBlog } from '../models/blogs/input/update'
import { ExtendedCreateBlog } from '../models/blogs/input/create'

export class BlogRepository {
  static async getAllBlogs(): Promise<OutputBlog[]> {
    const blogs = await blogCollection.find({}).toArray()

    return blogs.map(blogMapper)
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