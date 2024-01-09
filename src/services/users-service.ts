import bcrypt from 'bcrypt'
import { CreateUser, ExtendedCreateUser } from '../models/users/input/create'
import { UsersRepository } from '../repositories/users-repository'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'
import { UserDB } from '../models/db/db'
import { WithId } from 'mongodb'
import { AuthLogin } from '../models/auth/input/create'

export class UsersService {
  static async createUser(userData: CreateUser): Promise<string> {
    const { login, password, email } = userData
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(password, passwordSalt)

    const newUser: ExtendedCreateUser = {
      login,
      password: passwordHash,
      passwordSalt,
      email,
      isDeleted: false,
      createdAt: new Date().toISOString()
    }

    return UsersRepository.createUser(newUser)
  }

  static async checkCredentials(credentials: AuthLogin): Promise<null | WithId<UserDB>> {
    const user = await UsersQueryRepository.findUserByLoginOrEmail(credentials.loginOrEmail)

    if (!user) return null
    const passwordHash = await this._generateHash(credentials.password, user.passwordSalt)

    if (user.password === passwordHash) {
      return user
    }

    return null
  }

  static async _generateHash(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
