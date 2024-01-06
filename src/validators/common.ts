import { BlogsQueryRepository } from '../repositories/query/blogs-query-repository'

export const checkBlogIdValidity = async (blogId: string) => {
  const blog = await BlogsQueryRepository.getBlogById(blogId)
  return Boolean(blog)
}
