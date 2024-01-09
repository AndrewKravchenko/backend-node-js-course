import { Response, Router } from 'express'
import {
  BlogId,
  RequestWithBody,
  RequestWithBodyAndParams,
  RequestWithParams,
  RequestWithQuery,
  RequestWithQueryAndParams
} from '../models/common'
import { HTTP_STATUS } from '../constants/httpStatus'
import { basicAuthMiddleware } from '../middlewares/auth/auth-middleware'
import { blogValidation } from '../validators/blogs-validator'
import { CreateBlog, CreatePostToBlog } from '../models/blogs/input/create'
import { UpdateBlog } from '../models/blogs/input/update'
import { QueryBlog, QueryPostByBlogId } from '../models/blogs/input/query'
import { blogIdValidation, postToBlogValidation } from '../validators/posts-validator'
import { CreatePost } from '../models/posts/input/create'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { matchedData } from 'express-validator'
import { BlogService } from '../services/blogs-service'
import { PostService } from '../services/posts-service'
import { PostsQueryRepository } from '../repositories/query/posts-query-repository'

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: RequestWithQuery<QueryBlog>, res: Response) => {
  const query = matchedData(req, { locations: ['query'] }) as QueryBlog
  const blogs = await BlogsQueryRepository.getBlogs(query)

  res.send(blogs)
})

blogsRouter.get('/:blogId', blogIdValidation(), async (req: RequestWithParams<BlogId>, res: Response) => {
  const blogId = req.params.blogId
  const blog = await BlogsQueryRepository.getBlogById(blogId)

  if (blog) {
    res.send(blog)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

blogsRouter.get('/:blogId/posts', blogIdValidation(),
  async (req: RequestWithQueryAndParams<BlogId, QueryPostByBlogId>, res: Response) => {
    const blogId = req.params.blogId
    const blog = await BlogsQueryRepository.getBlogById(blogId)

    if (!blog) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
      return
    }

    const query = matchedData(req, { locations: ['query'] }) as QueryPostByBlogId
    const posts = await BlogsQueryRepository.getPostsByBlogId(blogId, query)

    res.send(posts)
  })

blogsRouter.post('/', basicAuthMiddleware, blogValidation(),
  async (req: RequestWithBody<CreateBlog>, res: Response) => {
    const newBlog = matchedData(req) as CreateBlog

    const blogId = await BlogService.createBlog(newBlog)
    const createdBlog = await BlogsQueryRepository.getBlogById(blogId)

    res.status(HTTP_STATUS.CREATED).send(createdBlog)
  })

blogsRouter.post('/:blogId/posts', basicAuthMiddleware, blogIdValidation(), postToBlogValidation(),
  async (req: RequestWithBodyAndParams<BlogId, CreatePostToBlog>, res: Response) => {
    const blogId = req.params.blogId
    const newPost = matchedData(req, { locations: ['params', 'body'] }) as CreatePost
    const blog = await BlogsQueryRepository.getBlogById(blogId)

    if (!blog) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
      return
    }

    const createdPostId = await PostService.createPost(newPost)
    const createdPost = await PostsQueryRepository.getPostById(createdPostId)

    if (!createdPost) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
      return
    }

    res.status(HTTP_STATUS.CREATED).send(createdPost)
  })

blogsRouter.put('/:blogId', basicAuthMiddleware, blogIdValidation(), blogValidation(),
  async (req: RequestWithBodyAndParams<BlogId, UpdateBlog>, res: Response) => {
    const blogId = req.params.blogId
    const updatedBlog = matchedData(req) as UpdateBlog
    const isUpdated = await BlogService.updateBlog(blogId, updatedBlog)

    if (isUpdated) {
      res.send(HTTP_STATUS.NO_CONTENT)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

blogsRouter.delete('/:blogId', basicAuthMiddleware, blogIdValidation(),
  async (req: RequestWithParams<BlogId>, res: Response) => {
    const blogId = req.params.blogId
    const isDeleted = await BlogService.deleteBlog(blogId)

    if (isDeleted) {
      res.sendStatus(HTTP_STATUS.NO_CONTENT)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })
