import { UpdatePost } from '../models/posts/input/update'
import { CreatePost, ExtendedCreatePost } from '../models/posts/input/create'
import { PostsRepository } from '../repositories/posts-repository'

export class PostService {
  static async createPost(postData: CreatePost): Promise<string> {
    const newPost: ExtendedCreatePost = {
      title: postData.title,
      blogId: postData.blogId,
      content: postData.content,
      shortDescription: postData.shortDescription,
      createdAt: new Date().toISOString()
    }

    return await PostsRepository.createPost(newPost)
  }

  static async updatePost(postId: string, updatedPost: UpdatePost): Promise<boolean> {
    return await PostsRepository.updatePost(postId, updatedPost)

  }

  static async deletePost(postId: string): Promise<boolean> {
    return await PostsRepository.deletePost(postId)
  }
}