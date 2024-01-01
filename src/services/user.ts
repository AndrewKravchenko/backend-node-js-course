import bcrypt from 'bcrypt'
import { ExtendedCreateUser } from '../models/users/input/create'
import { UserRepository } from '../repositories/user'

export const usersService = {
  async createUser(login: string, email: string, password: string) {
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

    return UserRepository.createUser(newUser)
  },

  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await UserRepository.findByLoginOrEmail(loginOrEmail)

    if (!user) return false
    const passwordHash = await this._generateHash(password, user.passwordSalt)

    return user.password === passwordHash
  },

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt)
  }
}
