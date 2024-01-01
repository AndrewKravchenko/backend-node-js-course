import { userCollection } from '../db/db'
import { paginationSkip } from '../utils/queryParams'
import { QueryUsers } from '../models/users/input/query'
import { OutputUser, OutputUsers } from '../models/users/output/output'
import { userMapper } from '../models/users/mappers/mapper'
import { ExtendedCreateUser } from '../models/users/input/create'
import { Filter, ObjectId, WithId } from 'mongodb'
import { UserDB } from '../models/db/db'

export class UserRepository {
  static async getAllUsers(sortData: QueryUsers): Promise<OutputUsers> {
    const sortBy = sortData.sortBy || 'createdAt'
    const sortDirection = sortData.sortDirection || 'desc'
    const pageNumber = Number(sortData.pageNumber || 1)
    const pageSize = Number(sortData.pageSize || 10)
    const searchLoginTerm = sortData.searchLoginTerm || null
    const searchEmailTerm = sortData.searchEmailTerm || null

    let filter: Filter<UserDB> = { isDeleted: false }

    if (searchLoginTerm) {
      filter.$or = [
        { login: { $regex: searchLoginTerm, $options: 'i' } }
      ]
    }

    if (searchEmailTerm) {
      filter.$or = filter.$or || []
      filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } })
    }

    const users = await userCollection
      .find(filter)
      .sort(sortBy, sortDirection)
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)
      .toArray()

    const totalCount = await userCollection.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users.map(userMapper)
    }
  }

  static async getUserById(id: string): Promise<OutputUser | null> {
    const user = await userCollection.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return null
    }

    return userMapper(user)
  }

  static async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDB> | null> {
    return await userCollection.findOne({
      $or: [
        { login: { $regex: loginOrEmail, $options: 'i' } },
        { email: { $regex: loginOrEmail, $options: 'i' } }
      ]
    })
  }


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
