import { Response, Router } from 'express'
import { BlogRepository } from '../repositories/blog'
import {
  RequestWithBody,
  RequestWithBodyAndParams,
  RequestWithParams,
  RequestWithQuery,
  RequestWithQueryAndParams
} from '../models/common'
import { HttpStatus } from '../../constants/httpStatus'
import { authMiddleware } from '../middlewares/auth/auth'
import { blogValidation } from '../validators/blog'
import { ObjectId } from 'mongodb'
import { CreateBlog, CreatePostToBlog, ExtendedCreateBlog } from '../models/blogs/input/create'
import { UpdateBlog } from '../models/blogs/input/update'
import { QueryBlog, QueryPostByBlogID } from '../models/blogs/input/query'
import { PostRepository } from '../repositories/post'
import { postToBlogValidation } from '../validators/post'
import { ExtendedCreatePost } from '../models/posts/input/create'

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: RequestWithQuery<QueryBlog>, res: Response) => {
  const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize, } = req.query
  const sortData = {
    searchNameTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }

  const blogs = await BlogRepository.getAllBlogs(sortData)

  res.send(blogs)
})

blogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const blogId = req.params.id

  if (!ObjectId.isValid(blogId)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const blog = await BlogRepository.getBlogById(blogId)

  if (!blog) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.send(blog)
})

blogsRouter.get('/:id/posts', async (req: RequestWithQueryAndParams<QueryPostByBlogID>, res: Response) => {
  const blogId = req.params.id

  if (!ObjectId.isValid(blogId)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const blog = await BlogRepository.getBlogById(blogId)

  if (!blog) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const { sortBy, sortDirection, pageNumber, pageSize, } = req.query
  const sortData: QueryPostByBlogID = {
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }

  const posts = await BlogRepository.getPostsByBlogId(blogId, sortData)

  res.send(posts)
})

blogsRouter.post('/', authMiddleware, blogValidation(), async (req: RequestWithBody<CreateBlog>, res: Response) => {
  const { name, description, websiteUrl } = req.body
  const newBlog: ExtendedCreateBlog = {
    name,
    description,
    websiteUrl,
    isMembership: false,
    createdAt: new Date().toISOString(),
  }

  const blogId = await BlogRepository.createBlog(newBlog)
  const createdBlog = await BlogRepository.getBlogById(blogId)

  res.status(HttpStatus.CREATED).send(createdBlog)
})

blogsRouter.post('/:id/posts', authMiddleware, postToBlogValidation(), async (req: RequestWithBodyAndParams<CreatePostToBlog>, res: Response) => {
  const blogId = req.params.id
  const { title, shortDescription, content } = req.body
  const blog = await BlogRepository.getBlogById(blogId)

  if (!blog) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const newPost: ExtendedCreatePost = {
    title,
    blogId,
    content,
    shortDescription,
    blogName: blog.name,
    createdAt: new Date().toISOString()
  }

  const createdPostId = await PostRepository.createPost(newPost)
  const createdPost = await PostRepository.getPostById(createdPostId)

  if (!createdPostId) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  res.status(HttpStatus.CREATED).send(createdPost)
})

blogsRouter.put('/:id', authMiddleware, blogValidation(), async (req: RequestWithBodyAndParams<UpdateBlog>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const { name, description, websiteUrl } = req.body
  const updatedBlogData = {
    name,
    description,
    websiteUrl
  }

  const isUpdated = await BlogRepository.updateBlog(id, updatedBlogData)

  if (isUpdated) {
    res.send(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})

blogsRouter.delete('/:id', authMiddleware, async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    res.sendStatus(HttpStatus.NOT_FOUND)
    return
  }

  const isDeleted = await BlogRepository.deleteBlog(id)

  if (isDeleted) {
    res.sendStatus(HttpStatus.NO_CONTENT)
  } else {
    res.sendStatus(HttpStatus.NOT_FOUND)
  }
})