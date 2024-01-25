import { CreateUser } from '../models/users/input/create'
import { UsersService } from './users-service'
import { EmailManager } from '../managers/emails/email-manager'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { UsersRepository } from '../repositories/users-repository'
import { v4 as uuidv4 } from 'uuid'
import { HTTP_STATUS } from '../constants/httpStatus'
import { OutputUser } from '../models/users/output/output'
import { jwtService } from './jwt-service'
import { AuthLogin } from '../models/auth/input/create'
import { OutputLogin } from '../models/auth/output/output'
import { Error, ErrorMessage } from '../models/common'

export class AuthService {
  static async getMe(userId: string | null): Promise<{ code: HTTP_STATUS; data?: OutputUser; }> {
    if (!userId) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const user = await UsersQueryRepository.getUserById(userId)

    if (user) {
      return { code: HTTP_STATUS.OK, data: user }
    } else {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }
  }

  static async login(credentials: AuthLogin): Promise<{ code: number; data?: OutputLogin }> {
    const user = await UsersService.checkCredentials(credentials)

    if (user) {
      return { code: HTTP_STATUS.OK, data: { accessToken: jwtService.createJWT(user._id.toString()) } }
    } else {
      return { code: HTTP_STATUS.UNAUTHORIZED }
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

    await UsersRepository.updateConfirmationCode(user._id, confirmationCode)
    await EmailManager.sendRegistrationConfirmationEmail(email, confirmationCode)

    return { code: HTTP_STATUS.NO_CONTENT }
  }
}
