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
import { blogsValidation, blogValidation, postsByBlogIdValidation } from '../validators/blogs-validator'
import { CreateBlog, CreatePostToBlog } from '../models/blogs/input/create'
import { UpdateBlog } from '../models/blogs/input/update'
import { QueryBlog, QueryPostByBlogId } from '../models/blogs/input/query'
import { postToBlogValidation } from '../validators/posts-validator'
import { CreatePost } from '../models/posts/input/create'
import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { matchedData } from 'express-validator'
import { BlogService } from '../services/blogs-service'

export const blogsRouter = Router({})
blogsRouter.get('/', blogsValidation(), async (req: RequestWithQuery<Partial<QueryBlog>>, res: Response) => {
  const query = matchedData(req, { locations: ['query'] }) as QueryBlog
  const blogs = await BlogsQueryRepository.getBlogs(query)

  res.send(blogs)
})

blogsRouter.get('/:blogId', async (req: RequestWithParams<BlogId>, res: Response) => {
  const blog = await BlogService.getBlogById(req.params.blogId)

  if (blog) {
    res.send(blog)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})

blogsRouter.get('/:blogId/posts', postsByBlogIdValidation(),
  async (req: RequestWithQueryAndParams<BlogId, Partial<QueryPostByBlogId>>, res: Response) => {
    const query = matchedData(req, { locations: ['query'] }) as QueryPostByBlogId
    const posts = await BlogService.getPostsByBlogId(req.params.blogId, query)

    if (posts) {
      res.send(posts)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

blogsRouter.post('/', basicAuthMiddleware, blogValidation(),
  async (req: RequestWithBody<CreateBlog>, res: Response) => {
    const newBlog = matchedData(req) as CreateBlog
    const createdBlog = await BlogService.createBlog(newBlog)

    if (createdBlog) {
      res.status(HTTP_STATUS.CREATED).send(createdBlog)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

blogsRouter.post('/:blogId/posts', basicAuthMiddleware, postToBlogValidation(),
  async (req: RequestWithBodyAndParams<BlogId, CreatePostToBlog>, res: Response) => {
    const newPost = matchedData(req, { locations: ['params', 'body'] }) as CreatePost
    const createdPost = await BlogService.createPostToBlog(req.params.blogId, newPost)

    if (createdPost) {
      res.status(HTTP_STATUS.CREATED).send(createdPost)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

blogsRouter.put('/:blogId', basicAuthMiddleware, blogValidation(),
  async (req: RequestWithBodyAndParams<BlogId, UpdateBlog>, res: Response) => {
    const updatedBlog = matchedData(req) as UpdateBlog
    const isUpdated = await BlogService.updateBlog(req.params.blogId, updatedBlog)

    if (isUpdated) {
      res.send(HTTP_STATUS.NO_CONTENT)
    } else {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    }
  })

blogsRouter.delete('/:blogId', basicAuthMiddleware, async (req: RequestWithParams<BlogId>, res: Response) => {
  const isDeleted = await BlogService.deleteBlog(req.params.blogId)

  if (isDeleted) {
    res.sendStatus(HTTP_STATUS.NO_CONTENT)
  } else {
    res.sendStatus(HTTP_STATUS.NOT_FOUND)
  }
})
