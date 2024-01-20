import { CreateUser } from '../models/users/input/create'
import { UsersService } from './users-service'
import { EmailManager } from '../managers/emails/email-manager'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { UsersRepository } from '../repositories/users-repository'
import { v4 as uuidv4 } from 'uuid'

export class AuthService {
  static async createUser(userData: CreateUser): Promise<void | null> {
    const createdUserId = await UsersService.createUser(userData)
    const emailConfirmationData = await UsersQueryRepository.getEmailConfirmationDataByUserId(createdUserId)

    if (!emailConfirmationData?.confirmationCode) {
      return null
    }

    await EmailManager.sendRegistrationConfirmationEmail(userData.email, emailConfirmationData.confirmationCode)
  }


  static async confirmEmail(code: string): Promise<boolean> {
    const user = await UsersQueryRepository.getUserByConfirmationCode(code)

    if (!user?.emailConfirmation?.expirationDate) {
      return false
    }

    if (user.emailConfirmation.confirmationCode === code && user.emailConfirmation.expirationDate > new Date()) {
      return await UsersRepository.updateConfirmation(user._id)
    }

    return false
  }

  static async resendRegistrationEmail(email: string): Promise<boolean> {
    const user = await UsersQueryRepository.getUserByLoginOrEmail(email)

    if (!user?.emailConfirmation) {
      return false
    }

    const confirmationCode = uuidv4()

    await UsersRepository.updateConfirmationCode(user._id, confirmationCode)
    await EmailManager.sendRegistrationConfirmationEmail(email, confirmationCode)

    return true
  }
}
