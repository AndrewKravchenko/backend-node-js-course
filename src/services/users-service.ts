import bcrypt from 'bcrypt'
import { CreateUser, ExtendedCreateUser } from '../models/users/input/create'
import { UsersRepository } from '../repositories/users-repository'
import { UsersQueryRepository } from '../repositories/query/users-query-repository'

export class UsersService {
  static async createUser(userData: CreateUser) {
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

  static async checkCredentials(loginOrEmail: string, password: string) {
    const user = await UsersQueryRepository.findUserByLoginOrEmail(loginOrEmail)

    if (!user) return false
    const passwordHash = await this._generateHash(password, user.passwordSalt)

    return user.password === passwordHash
  }

  static async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt)
  }
}
