import { UpdatePost } from '../models/posts/input/update'
import { CreateCommentToPost, CreatePost, ExtendedCreatePost } from '../models/posts/input/create'
import { PostsRepository } from '../repositories/posts-repository'
import { CreateComment } from '../models/comments/input/create'
import { CommentatorInfo } from '../models/db/db'
import { PostId } from '../models/common'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { CommentsRepository } from '../repositories/comments-repository'
import { ObjectId } from 'mongodb'
import { PostsQueryRepository } from '../repositories/query/posts-query-repository'
import { OutputPost } from '../models/posts/output/output'
import { QueryComment } from '../models/comments/input/query'
import { CommentsQueryRepository } from '../repositories/query/comments-query-repository'
import { OutputComment, OutputComments } from '../models/comments/output/output'
import { BlogService } from './blogs-service'

export class PostService {
  static async getPostById(postId: string): Promise<OutputPost | null> {
    if (ObjectId.isValid(postId)) {
      return await PostsQueryRepository.getPostById(postId)
    }

    return null
  }

  static async getCommentsByPostId(postId: string, query: QueryComment): Promise<OutputComments | null> {
    const post = await this.getPostById(postId)

    if (!post) {
      return null
    }

    return await CommentsQueryRepository.getCommentsByPostId(query, postId)
  }

  static async createCommentToPost(comment: CreateCommentToPost & PostId, userId: string): Promise<OutputComment | null> {
    const post = await PostService.getPostById(comment.postId)

    if (!post) {
      return null
    }

    const user = await UsersQueryRepository.getUserById(userId)
    const commentatorInfo: CommentatorInfo = { userId, userLogin: user!.login }
    const newComment: CreateComment = {
      postId: comment.postId,
      content: comment.content,
      commentatorInfo,
      createdAt: new Date().toISOString()
    }

    const commentId = await CommentsRepository.createCommentToPost(newComment)
    return await CommentsQueryRepository.getCommentById(commentId)
  }

  static async createPost(postData: CreatePost): Promise<OutputPost | null> {
    const blog = await BlogService.getBlogById(postData.blogId)

    if (!blog) {
      return null
    }

    const newPost: ExtendedCreatePost = {
      title: postData.title,
      blogId: postData.blogId,
      content: postData.content,
      blogName: blog!.name,
      shortDescription: postData.shortDescription,
      createdAt: new Date().toISOString()
    }

    const createdPostId = await PostsRepository.createPost(newPost)
    return await PostsQueryRepository.getPostById(createdPostId)
  }

  static async updatePost(postId: string, updatedPost: UpdatePost): Promise<boolean> {
    const post = await this.getPostById(postId)

    if (!post) {
      return false
    }

    return await PostsRepository.updatePost(postId, updatedPost)
  }

  static async deletePost(postId: string): Promise<boolean> {
    const post = await this.getPostById(postId)

    if (!post) {
      return false
    }

    return await PostsRepository.deletePost(postId)
  }
}