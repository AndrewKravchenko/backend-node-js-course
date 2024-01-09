import { UpdatePost } from '../models/posts/input/update'
import { CreateCommentToPost, CreatePost, ExtendedCreatePost } from '../models/posts/input/create'
import { PostsRepository } from '../repositories/posts-repository'
import { CreateComment } from '../models/comments/input/create'
import { CommentatorInfo } from '../models/db/db'
import { PostId } from '../models/common'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { CommentsRepository } from '../repositories/comments-repository'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'

export class PostService {
  static async createCommentToPost(comment: CreateCommentToPost & PostId, userId: string): Promise<string> {
    const user = await UsersQueryRepository.getUserById(userId)
    const commentatorInfo: CommentatorInfo = { userId, userLogin: user!.login }
    const newComment: CreateComment = {
      postId : comment.postId,
      content: comment.content,
      commentatorInfo,
      createdAt: new Date().toISOString()
    }

    return await CommentsRepository.createCommentToPost(newComment)
  }

  static async createPost(postData: CreatePost): Promise<string> {
    const blog = await BlogsQueryRepository.getBlogById(postData.blogId)

    const newPost: ExtendedCreatePost = {
      title: postData.title,
      blogId: postData.blogId,
      content: postData.content,
      blogName: blog!.name,
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