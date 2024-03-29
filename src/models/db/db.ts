import { EmailConfirmation, PasswordRecovery } from '../users/input/create'

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
  extendedLikesInfo: LikesCountDB
  createdAt: string,
}

export type UserDB = {
  password: string,
  passwordSalt: string,
  login: string,
  email: string,
  isDeleted: boolean,
  passwordRecovery?: PasswordRecovery
  emailConfirmation?: EmailConfirmation
  createdAt: string,
}

export type CommentDB = {
  postId: string,
  content: string,
  commentatorInfo: CommentatorInfo
  likesInfo?: LikesCountDB
  createdAt: string,
}

export type LikesCountDB = {
  likesCount: number,
  dislikesCount: number,
}

export type NewestLikesDB = {
  userId: string
  login: string
  addedAt: string
}

export type LikesDB = {
  userId: string
  commentId?: string
  postId?: string
  myStatus: LikeStatus
  createdAt: string,
}

export type RequestLogsDB = {
  ip: string,
  url: string,
  date: Date,
  createdAt: string,
}

export type SessionsDB = {
  ip: string
  userId: string
  deviceId: string
  deviceName: string
  lastActiveDate: string
  expirationAt: string
  createdAt: string,
}

export type CommentatorInfo = {
  userId: string,
  userLogin: string
}


export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}
