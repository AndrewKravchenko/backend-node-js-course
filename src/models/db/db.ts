import { OutputBlog } from '../blogs/output/output'
import { OutputPost } from '../posts/output/output'
import { OutputUser } from '../users/output/output'

export type DB = {
  blogs: OutputBlog[],
  posts: OutputPost[],
  users: OutputUser[],
}

export type BlogDB = {
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean,
}

export type PostDB = {
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string,
}

export type UserDB = {
  password: string,
  passwordSalt: string,
  login: string,
  email: string,
  isDeleted: boolean,
  createdAt: string,
}
