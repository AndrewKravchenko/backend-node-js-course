import { db } from '../db/db'
import { Blog } from '../models/blogs/output'
import { UpdateBlog } from '../models/blogs/input'

export class BlogRepository {
  static getAllBlogs() {
    return db.blogs
  }

  static getBlogById(id: string) {
    return db.blogs.find((blog) => blog.id === id)
  }

  static createBlog(newBlog: Blog) {
    db.blogs.push(newBlog)
  }

  static updateBlog(id: string, updatedBlogData: UpdateBlog) {
    const blog = db.blogs.find((blog) => blog.id === id)

    if (!blog) {
      return false
    }

    const { name, websiteUrl, description } = updatedBlogData

    blog.name = name
    blog.websiteUrl = websiteUrl
    blog.description = description

    return true
  }

  static deleteBlog(id: string) {
    const blogs = db.blogs
    for (let i = 0; i < blogs.length; i++) {
      if (blogs[i].id === id) {
        blogs.splice(i, 1)

        return true
      }
    }

    return false
  }
}