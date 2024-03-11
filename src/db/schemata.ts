import { Schema } from 'mongoose'
import {
  BlogDB,
  CommentatorInfo,
  CommentDB,
  LikesCountDB,
  LikesDB,
  LikeStatus,
  PostDB,
  RequestLogsDB,
  SessionsDB,
  UserDB
} from '../models/db/db'
import { EmailConfirmation, PasswordRecovery } from '../models/users/input/create'

export const blogSchema = new Schema<BlogDB>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean, required: true },
})

const likesCountSchema = new Schema<LikesCountDB>({
  likesCount: { type: Number, required: true, default: 0 },
  dislikesCount: { type: Number, required: true, default: 0 },
})

export const postSchema = new Schema<PostDB>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  extendedLikesInfo: { type: likesCountSchema, required: true },
  createdAt: { type: String, required: true },
})

const passwordRecoverySchema = new Schema<PasswordRecovery>({
  code: { type: String, required: true },
  expirationDate: { type: Date, required: true },
})

const emailConfirmationSchema = new Schema<EmailConfirmation>({
  isConfirmed: { type: Boolean, required: true },
  confirmationCode: { type: String, required: true },
  expirationDate: { type: Date, required: true },
})

export const userSchema = new Schema<UserDB>({
  password: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  login: { type: String, required: true },
  email: { type: String, required: true },
  isDeleted: { type: Boolean, required: true },
  passwordRecovery: { type: passwordRecoverySchema },
  emailConfirmation: { type: emailConfirmationSchema },
  createdAt: { type: String, required: true },
})

const commentatorInfoSchema = new Schema<CommentatorInfo>({
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
})

export const likesSchema = new Schema<LikesDB>({
  userId: { type: String, required: true },
  commentId: { type: String },
  postId: { type: String },
  myStatus: { type: String, enum: LikeStatus, required: true, default: LikeStatus.None },
  createdAt: { type: String, required: true },
})

export const commentSchema = new Schema<CommentDB>({
  postId: { type: String, required: true },
  content: { type: String, required: true },
  likesInfo: { type: likesCountSchema, required: true },
  commentatorInfo: { type: commentatorInfoSchema, required: true },
  createdAt: { type: String, required: true },
})

export const requestLogsSchema = new Schema<RequestLogsDB>({
  ip: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: String, required: true },
})

export const sessionsSchema = new Schema<SessionsDB>({
  ip: { type: String, required: true },
  userId: { type: String, required: true },
  deviceId: { type: String, required: true },
  deviceName: { type: String, required: true },
  lastActiveDate: { type: String, required: true },
  expirationAt: { type: String, required: true },
  createdAt: { type: String, required: true },
})
