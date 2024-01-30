import { CreateUser } from '../models/users/input/create'
import { UsersService } from './users-service'
import { EmailManager } from '../managers/emails/email-manager'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { UsersRepository } from '../repositories/users-repository'
import { v4 as uuidv4 } from 'uuid'
import { HTTP_STATUS } from '../constants/httpStatus'
import { OutputMe } from '../models/users/output/output'
import { JWTService } from './jwt-service'
import { AuthLogin, FreshTokens, TokenPayload } from '../models/auth/input/create'
import { Error, ErrorMessage } from '../models/common'
import { SessionsRepository } from '../repositories/sessions-repository'
import { ObjectId } from 'mongodb'

export class AuthService {
  static async getMe(userId: string | null): Promise<{ code: HTTP_STATUS; data?: OutputMe; }> {
    if (!userId) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const user = await UsersQueryRepository.getMe(userId)

    if (user) {
      return { code: HTTP_STATUS.OK, data: user }
    } else {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }
  }

  static async login(credentials: AuthLogin): Promise<{
    code: number
    data?: FreshTokens
  }> {
    const user = await UsersService.checkCredentials(credentials)

    if (user && !user.emailConfirmation) {
      const sessions = await SessionsRepository.getUserSessions(user.id)

      if (sessions.length > 5) {
        await SessionsRepository.deleteOldestSession(user.id)
      }

      const payload: TokenPayload = {
        userId: user.id
      }

      return {
        code: HTTP_STATUS.OK,
        data: await JWTService.generateTokens(payload),
      }
    } else {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }
  }

  static async refreshAccessToken(refreshToken?: string): Promise<{
    code: number
    data?: FreshTokens
  }> {
    if (!refreshToken) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const decodedRefreshToken = JWTService.decodeToken(refreshToken)

    if (!decodedRefreshToken) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const { userId, jti: refreshTokenId } = decodedRefreshToken

    if (!userId || !ObjectId.isValid(userId) || !refreshTokenId) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const hasSession = await SessionsRepository.getSession(userId, refreshTokenId)
    if (!hasSession) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    await SessionsRepository.deleteSession(userId, refreshTokenId)

    const payload: TokenPayload = {
      userId,
    }

    return {
      code: HTTP_STATUS.OK,
      data: await JWTService.generateTokens(payload),
    }
  }

  static async createUser(newUser: CreateUser): Promise<void> {
    const createdUser = await UsersService.createUser(newUser)

    if (!createdUser?.id) {
      throw undefined
    }

    const emailConfirmationData = await UsersQueryRepository.getEmailConfirmationDataByUserId(createdUser.id)

    if (!emailConfirmationData) {
      throw undefined
    }

    await EmailManager.sendRegistrationConfirmationEmail(newUser.email, emailConfirmationData.confirmationCode)
  }

  static async confirmEmail(code: string): Promise<{ code: HTTP_STATUS; data?: Error }> {
    const errorsMessages: ErrorMessage[] = [{
      message: 'Incorrect code!',
      field: 'code',
    }]

    const user = await UsersQueryRepository.getUserByConfirmationCode(code)

    if (!user?.emailConfirmation) {
      return { code: HTTP_STATUS.BAD_REQUEST, data: { errorsMessages } }
    }

    const isCorrectCode = user.emailConfirmation.confirmationCode === code
    const isExpired = user.emailConfirmation.expirationDate < new Date()

    if (isCorrectCode && !isExpired) {
      await UsersRepository.updateConfirmation(user._id)
      return { code: HTTP_STATUS.NO_CONTENT }
    }

    return { code: HTTP_STATUS.BAD_REQUEST, data: { errorsMessages } }
  }

  static async resendRegistrationEmail(email: string): Promise<{ code: HTTP_STATUS; data?: Error }> {
    const user = await UsersQueryRepository.getUserByLoginOrEmail(email)

    if (!user?.emailConfirmation) {
      const errorsMessages: ErrorMessage[] = [{
        message: 'Incorrect email!',
        field: 'email',
      }]

      return { code: HTTP_STATUS.BAD_REQUEST, data: { errorsMessages } }
    }

    const confirmationCode = uuidv4()

    await UsersRepository.updateConfirmationCode(user.id, confirmationCode)
    await EmailManager.sendRegistrationConfirmationEmail(email, confirmationCode)

    return { code: HTTP_STATUS.NO_CONTENT }
  }

  static async logOut(refreshToken?: string): Promise<{ code: number }> {
    if (!refreshToken) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const decodedRefreshToken = JWTService.decodeToken(refreshToken)

    if (!decodedRefreshToken) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const { userId, jti: refreshTokenId } = decodedRefreshToken

    if (!userId || !ObjectId.isValid(userId) || !refreshTokenId) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const hasSession = await SessionsRepository.getSession(userId, refreshTokenId)
    if (!hasSession) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    await SessionsRepository.deleteSession(userId, refreshTokenId)

    return { code: HTTP_STATUS.NO_CONTENT, }
  }
}
