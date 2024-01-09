import { userCollection } from '../../db/db'
import { Filter, ObjectId, WithId } from 'mongodb'
import { paginationSkip } from '../../utils/queryParams'
import { UserDB } from '../../models/db/db'
import { QueryUser } from '../../models/users/input/query'
import { ExtendedOutputUser, OutputUser, OutputUsers } from '../../models/users/output/output'

export class UsersQueryRepository {
  static async getUsers({
    searchLoginTerm,
    searchEmailTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize
  }: QueryUser): Promise<OutputUsers> {
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
      items: users.map(this.mapDBUserToExtendedUserOutputModel)
    }
  }

  static async getUserById(userID: string): Promise<OutputUser | null> {
    const user = await userCollection.findOne({ _id: new ObjectId(userID) })

    if (!user) {
      return null
    }

    return this.mapDBUserToExtendedUserOutputModel(user)
  }

  static async findUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDB> | null> {
    return await userCollection.findOne({
      $or: [
        { login: { $regex: loginOrEmail, $options: 'i' } },
        { email: { $regex: loginOrEmail, $options: 'i' } }
      ]
    })
  }

  static mapDBUserToExtendedUserOutputModel(dbUser: WithId<UserDB>): ExtendedOutputUser {
    return {
      id: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
      createdAt: dbUser.createdAt,
    }
  }

  static mapDBUserToUserOutputModel(dbUser: WithId<UserDB>): OutputUser {
    return {
      id: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
    }
  }
}