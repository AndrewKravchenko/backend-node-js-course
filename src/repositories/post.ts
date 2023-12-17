import { db } from '../db/db'
import { Post } from '../models/posts/output'
import { UpdatePost } from '../models/posts/input'

export class PostRepository {
  static getAllPosts() {
    return db.posts
  }

  static getPostById(id: string) {
    return db.posts.find((blog) => blog.id === id)
  }

  static createPost(newPost: Post) {
    db.posts.push(newPost)
  }

  static updatePost(id: string, updatedPostData: UpdatePost) {
    const post = db.posts.find((blog) => blog.id === id)

    if (!post) return false
    const { title, shortDescription, content, blogId } = updatedPostData

    post.title = title
    post.content = content
    post.blogId = blogId
    post.shortDescription = shortDescription

    return true
  }

  static deletePost(id: string) {
    const posts = db.posts
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].id === id) {
        posts.splice(i, 1)

        return true
      }
    }

    return false
  }
}