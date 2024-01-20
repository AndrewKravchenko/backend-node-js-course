import { userCollection } from '../db/db'
import { ExtendedCreateUser } from '../models/users/input/create'
import { Condition, ObjectId } from 'mongodb'

export class UsersRepository {
  static async createUser(newUser: ExtendedCreateUser): Promise<string> {
    const { insertedId } = await userCollection.insertOne(newUser)

    return insertedId.toString()
  }

  static async updateConfirmation(userId: Condition<ObjectId>): Promise<boolean> {
    const result = await userCollection.updateOne(
      { _id: userId },
      { $unset: { 'emailConfirmation': '' } }
    )

    return !!result.matchedCount
  }

  static async updateConfirmationCode(userId: Condition<ObjectId>, confirmationCode: string): Promise<boolean> {
    const result = await userCollection.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.confirmationCode': confirmationCode } }
    )

    return !!result.matchedCount
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await userCollection.updateOne({ _id: new ObjectId(id) }, {
      $set: { isDeleted: true }
    })

    return !!result.matchedCount
  }
}
