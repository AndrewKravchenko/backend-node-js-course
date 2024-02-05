import { EmailConfirmation } from '../users/input/create'

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
  emailConfirmation?: EmailConfirmation
}

export type CommentDB = {
  postId: string,
  content: string,
  commentatorInfo: CommentatorInfo
  createdAt: string,
}

export type RequestLogsDB = {
  ip: string,
  url: string,
  date: Date,
  createdAt: string,
}

export type SessionsDB = {
  sessions: Session[]
}

export type Session = {
  refreshTokenId: string,
  createdAt: string,
}

export type CommentatorInfo = {
  userId: string,
  userLogin: string
}
