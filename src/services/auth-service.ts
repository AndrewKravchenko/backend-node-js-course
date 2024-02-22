import { CreateUser, PasswordRecovery } from '../models/users/input/create'
import { UsersService } from './users-service'
import { EmailManager } from '../managers/emails/email-manager'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { UsersRepository } from '../repositories/users-repository'
import { v4 as uuidv4 } from 'uuid'
import { HTTP_STATUS } from '../constants/httpStatus'
import { OutputMe } from '../models/users/output/output'
import { JWTService } from './jwt-service'
import { AuthLogin, FreshTokens, PasswordChangeData, TokenPayload } from '../models/auth/input/create'
import { Error, ErrorMessage } from '../models/common'
import { SessionsRepository } from '../repositories/sessions-repository'
import { SessionsQueryRepository } from '../repositories/query/sessions-query-repository'
import { CreateSession } from '../models/sessions/input/create'
import { convertUnixTimestampToISO } from '../utils/common'
import { JwtPayload } from 'jsonwebtoken'
import { UpdateSession } from '../models/sessions/input/update'
import { add } from 'date-fns/add'

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

  static async login(credentials: AuthLogin, ip = '', deviceName = ''): Promise<{
    code: number
    data?: FreshTokens
  }> {
    const user = await UsersService.checkCredentials(credentials)

    if (user && !user.emailConfirmation) {
      const userId = user.id
      const sessions = await SessionsQueryRepository.getSessionsByUserId(userId)

      if (sessions.length > 5) {
        await SessionsRepository.deleteOldestSession(userId)
      }

      const payload: TokenPayload = {
        userId
      }

      const tokens = await JWTService.generateTokens(payload)
      const { iat, exp, deviceId } = JWTService.decodeToken(tokens.refreshToken)

      const lastActiveDate = convertUnixTimestampToISO(iat!)
      const expirationAt = convertUnixTimestampToISO(exp!)

      const newSession: CreateSession = {
        ip,
        deviceId: deviceId!,
        userId,
        deviceName,
        lastActiveDate,
        expirationAt,
        createdAt: new Date().toISOString(),
      }

      await SessionsRepository.createSession(newSession)

      return {
        code: HTTP_STATUS.OK,
        data: tokens,
      }
    } else {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }
  }

  static async refreshAccessToken(refreshToken?: string, ip = ''): Promise<{
    code: number
    data?: FreshTokens
  }> {
    const { verifiedRefreshToken, isActiveSession } = await this.verifyRefreshTokenAndCheckCurrentSession(refreshToken)

    if (!verifiedRefreshToken?.deviceId || !isActiveSession) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const { userId, deviceId } = verifiedRefreshToken
    const payload: TokenPayload = {
      userId,
    }

    const newTokens = await JWTService.generateTokens(payload, deviceId)
    const newRefreshToken = JWTService.decodeToken(newTokens.refreshToken)

    const updatedSession: UpdateSession = {
      ip,
      expirationAt: convertUnixTimestampToISO(newRefreshToken.exp!),
      lastActiveDate: convertUnixTimestampToISO(newRefreshToken.iat!)
    }

    await SessionsRepository.refreshSession(userId, deviceId, updatedSession)

    return {
      code: HTTP_STATUS.OK,
      data: newTokens,
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

  static async sendPasswordRecoveryEmail(email: string): Promise<{ code: HTTP_STATUS; data?: Error }> {
    const user = await UsersQueryRepository.getUserByLoginOrEmail(email)

    if (!user) {
      return { code: HTTP_STATUS.NO_CONTENT }
    }

    const passwordRecovery: PasswordRecovery = {
      code: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 1
      }),
    }
    await UsersRepository.createRecoveryCode(user.id, passwordRecovery)
    await EmailManager.sendPasswordRecoveryEmail(email, passwordRecovery.code)

    return { code: HTTP_STATUS.NO_CONTENT }
  }

  static async changeUserPassword(passwordChangeData: PasswordChangeData): Promise<{
    code: HTTP_STATUS;
    data?: Error
  }> {
    const user = await UsersRepository.getUserByPasswordRecoveryCode(passwordChangeData.recoveryCode)

    if (!user?.passwordRecovery) {
      return { code: HTTP_STATUS.BAD_REQUEST }
    }

    const isCorrectCode = user.passwordRecovery.code === passwordChangeData.recoveryCode
    const isExpired = user.passwordRecovery.expirationDate < new Date()

    if (!isCorrectCode || isExpired) {
      return { code: HTTP_STATUS.BAD_REQUEST }
    }

    const passwordData = await UsersService.generatePasswordHash(passwordChangeData.newPassword)
    await UsersRepository.changeUserPassword(user._id, passwordData)

    return { code: HTTP_STATUS.NO_CONTENT }
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

  static async logOut(refreshToken: string): Promise<{ code: number }> {
    const { verifiedRefreshToken, isActiveSession } = await this.verifyRefreshTokenAndCheckCurrentSession(refreshToken)

    if (!verifiedRefreshToken || !isActiveSession) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    await SessionsRepository.deleteSessionByDeviceId(verifiedRefreshToken.deviceId!)

    return { code: HTTP_STATUS.NO_CONTENT, }
  }

  static async verifyRefreshTokenAndCheckCurrentSession(refreshToken?: string): Promise<{
    verifiedRefreshToken: JwtPayload | null,
    isActiveSession: boolean
  }> {
    const verifiedRefreshToken = JWTService.verifyToken(refreshToken)

    if (!verifiedRefreshToken) {
      return { verifiedRefreshToken: null, isActiveSession: false }
    }

    const isActiveSession = await this.isActiveSession(verifiedRefreshToken)

    return { verifiedRefreshToken, isActiveSession }
  }

  static async isActiveSession(verifiedRefreshToken: JwtPayload): Promise<boolean> {
    const { userId, iat, deviceId } = verifiedRefreshToken

    if (!deviceId) {
      return false
    }

    const session = await SessionsRepository.getDetailedSession(userId, deviceId)
    const lastActiveDate = convertUnixTimestampToISO(iat!)

    return session?.lastActiveDate === lastActiveDate
  }
}
