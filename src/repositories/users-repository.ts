import { usersModel } from '../db/db'
import { ExtendedCreateUser, PasswordHashResult, PasswordRecovery } from '../models/users/input/create'
import { Condition, ObjectId, WithId } from 'mongodb'
import { UserDB } from '../models/db/db'

export class UsersRepository {
  static async getUserByPasswordRecoveryCode(code: string): Promise<WithId<UserDB> | null> {
    const user = await usersModel.findOne({ 'passwordRecovery.code': code })

    if (!user) {
      return null
    }

    return user
  }

  static async createUser(newUser: ExtendedCreateUser): Promise<string> {
    const { _id } = await usersModel.create(newUser)

    return _id.toString()
  }

  static async createRecoveryCode(userId: string, passwordRecovery: PasswordRecovery): Promise<boolean> {
    const result = await usersModel.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { passwordRecovery } }
    )

    return !!result.matchedCount
  }

  static async changeUserPassword(userId: Condition<ObjectId>, passwordData: PasswordHashResult): Promise<boolean> {
    const result = await usersModel.updateOne(
      { _id: userId },
      {
        $set: { passwordSalt: passwordData.passwordSalt, password: passwordData.passwordHash },
        $unset: { 'passwordRecovery': '' }
      }
    )

    return !!result.matchedCount
  }

  static async updateConfirmation(userId: Condition<ObjectId>): Promise<boolean> {
    const result = await usersModel.updateOne(
      { _id: userId },
      { $unset: { 'emailConfirmation': '' } }
    )

    return !!result.matchedCount
  }

  static async updateConfirmationCode(userId: string, confirmationCode: string): Promise<boolean> {
    const result = await usersModel.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { 'emailConfirmation.confirmationCode': confirmationCode } }
    )

    return !!result.matchedCount
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const result = await usersModel.updateOne({ _id: new ObjectId(userId) }, {
      $set: { isDeleted: true }
    })

    return !!result.matchedCount
  }
}
