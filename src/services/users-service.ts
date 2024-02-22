import bcrypt from 'bcrypt'
import { CreateUser, ExtendedCreateUser, PasswordHashResult } from '../models/users/input/create'
import { UsersRepository } from '../repositories/users-repository'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { AuthLogin } from '../models/auth/input/create'
import { add } from 'date-fns/add'
import { ErrorMessage } from '../models/common'
import { ExtendedOutputUser, OutputUser } from '../models/users/output/output'

export class UsersService {
  static async createUser(userData: CreateUser, shouldUserConfirm = true): Promise<OutputUser | null> {
    const { login, password, email } = userData
    const existingUser = await UsersQueryRepository.getUserByLoginOrEmail(login, email)

    if (existingUser) {
      const incorrectField = existingUser.login === login ? 'login' : 'email'
      const errorsMessages: ErrorMessage[] = [{
        message: `Incorrect ${incorrectField}!`,
        field: incorrectField,
      }]

      throw { errorsMessages }
    }

    const { passwordSalt, passwordHash } = await this.generatePasswordHash(password)
    const newUser: ExtendedCreateUser = {
      login,
      password: passwordHash,
      passwordSalt,
      email,
      isDeleted: false,
      createdAt: new Date().toISOString()
    }

    if (shouldUserConfirm) {
      newUser.emailConfirmation = {
        isConfirmed: false,
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 1
        }),
      }
    }

    const createdUserId = await UsersRepository.createUser(newUser)
    return UsersQueryRepository.getUserById(createdUserId)
  }

  static async checkCredentials(credentials: AuthLogin): Promise<null | ExtendedOutputUser> {
    const user = await UsersQueryRepository.getUserByLoginOrEmail(credentials.loginOrEmail)

    if (!user) {
      return null
    }
    const passwordHash = await this._generateHash(credentials.password, user.passwordSalt)

    if (user.password === passwordHash) {
      return user
    }

    return null
  }

  static async generatePasswordHash(password: string): Promise<PasswordHashResult> {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(password, passwordSalt)

    return { passwordSalt, passwordHash }
  }

  static async _generateHash(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }

  static async deleteUser(userId: string): Promise<boolean> {
    if (!ObjectId.isValid(userId)) {
      return false
    }

    return await UsersRepository.deleteUser(userId)
  }
}
