import { userCollection } from '../db/db'
import { ExtendedCreateUser } from '../models/users/input/create'
import { Filter, ObjectId } from 'mongodb'
import { UserDB } from '../models/db/db'

export class UsersRepository {
  static async isUserExists(login: string, email: string): Promise<boolean> {
    const query: Filter<UserDB> = {
      $or: [
        { login: { $regex: login, $options: 'i' } },
        { email: { $regex: email, $options: 'i' } }
      ]
    }

    const existingUser = await userCollection.findOne(query)
    return !!existingUser
  }


  static async createUser(newUser: ExtendedCreateUser): Promise<string> {
    const { insertedId } = await userCollection.insertOne(newUser)

    return insertedId.toString()
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await userCollection.updateOne({ _id: new ObjectId(id) }, {
      $set: { isDeleted: true }
    })

    return !!result.matchedCount
  }
}
