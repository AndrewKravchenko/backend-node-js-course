import { UpdatePost } from '../models/posts/input/update'
import { CreateCommentToPost, CreatePost, ExtendedCreatePost } from '../models/posts/input/create'
import { PostsRepository } from '../repositories/posts-repository'
import { CreateComment } from '../models/comments/input/create'
import { PostId } from '../models/common'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { CommentsRepository } from '../repositories/comments-repository'
import { ObjectId } from 'mongodb'
import { PostsQueryRepository } from '../repositories/query/posts-query-repository'
import { OutputPost, OutputPostDB, OutputPosts } from '../models/posts/output/output'
import { QueryComment } from '../models/comments/input/query'
import { CommentsQueryRepository } from '../repositories/query/comments-query-repository'
import { OutputComment, OutputComments } from '../models/comments/output/output'
import { BlogService } from './blogs-service'
import { LikeStatus } from '../models/db/db'
import { Result, ResultCode } from '../types/resultLayer'
import { LikesService } from './likes-service'
import { PostQuery } from '../models/posts/input/query'

export class PostService {
  static async getPosts(postQuery: PostQuery, userId?: string): Promise<OutputPosts> {
    const posts = await PostsQueryRepository.getPosts(postQuery)

    const postItems: OutputPost[] = await Promise.all(posts.items.map(async (post) => {
      const { likesCount, dislikesCount } = post.extendedLikesInfo
      const myStatus = await LikesService.getLikeInfoByPostId(post.id, userId) || LikeStatus.None
      const newestLikes = await LikesService.getPostNewestLikes(post.id)

      return {
        ...post, extendedLikesInfo: { likesCount, dislikesCount, myStatus, newestLikes }
      }
    }))

    return { ...posts, items: postItems }
  }

  static async getPostById(postId: string, userId?: string): Promise<OutputPost | null> {
    if (ObjectId.isValid(postId)) {
      const post = await PostsQueryRepository.getPostById(postId)

      if (post) {
        const { likesCount, dislikesCount } = post.extendedLikesInfo
        const myStatus = await LikesService.getLikeInfoByPostId(postId, userId) || LikeStatus.None
        const newestLikes = await LikesService.getPostNewestLikes(postId)

        return {
          ...post, extendedLikesInfo: { likesCount, dislikesCount, myStatus, newestLikes }
        }
      }
    }

    return null
  }

  static async getCommentsByPostId(query: QueryComment, postId: string, userId?: string): Promise<OutputComments | null> {
    const post = await this.getPostById(postId)

    if (!post) {
      return null
    }

    return await CommentsQueryRepository.getCommentsByPostId(query, postId, userId)
  }

  static async createCommentToPost(comment: CreateCommentToPost & PostId, userId: string): Promise<OutputComment | null> {
    const post = await PostService.getPostById(comment.postId)
    const user = await UsersQueryRepository.getUserById(userId)

    if (!post || !user) {
      return null
    }

    const newComment: CreateComment = {
      postId: comment.postId,
      content: comment.content,
      commentatorInfo: { userId, userLogin: user.login },
      likesInfo: { likesCount: 0, dislikesCount: 0 },
      createdAt: new Date().toISOString()
    }

    const commentId = await CommentsRepository.createCommentToPost(newComment)
    return await CommentsQueryRepository.getCommentById(commentId, userId)
  }

  static async createPost(postData: CreatePost): Promise<OutputPostDB | null> {
    const blog = await BlogService.getBlogById(postData.blogId)

    if (!blog) {
      return null
    }

    const newPost: ExtendedCreatePost = {
      title: postData.title,
      blogId: postData.blogId,
      content: postData.content,
      blogName: blog!.name,
      extendedLikesInfo: { likesCount: 0, dislikesCount: 0 },
      shortDescription: postData.shortDescription,
      createdAt: new Date().toISOString()
    }

    const createdPostId = await PostsRepository.createPost(newPost)
    return await this.getPostById(createdPostId)
  }

  static async updatePost(postId: string, updatedPost: UpdatePost): Promise<boolean> {
    const post = await this.getPostById(postId)

    if (!post) {
      return false
    }

    return await PostsRepository.updatePost(postId, updatedPost)
  }

  static async updateLikeStatus(userId: string, postId: string, newLikeStatus: LikeStatus): Promise<Result> {
    const post = await this.getPostById(postId)
    console.log('post', post)
    if (!post) {
      return { resultCode: ResultCode.NotFound }
    }

    const myStatus = await LikesService.getLikeInfoByPostId(postId, userId)

    if (myStatus === newLikeStatus) {
      return { resultCode: ResultCode.Success }
    }

    await this.updateLikesCount(postId, myStatus || LikeStatus.None, newLikeStatus)

    if (myStatus) {
      await LikesService.updatePostLikeStatus(postId, userId, newLikeStatus)
    } else {
      await LikesService.createPostLikeStatus(postId, userId, newLikeStatus)
    }

    return { resultCode: ResultCode.Success }
  }

  static async updateLikesCount(postId: string, currentLikeStatus: LikeStatus, newLikeStatus: LikeStatus): Promise<boolean> {
    const likesCountUpdate = LikesService.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)

    return await PostsRepository.updateLikesCount(postId, likesCountUpdate)
  }

  static async deletePost(postId: string): Promise<boolean> {
    const post = await this.getPostById(postId)

    if (!post) {
      return false
    }

    return await PostsRepository.deletePost(postId)
  }
}
