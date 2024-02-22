import { usersModel } from '../../db/db'
import { ObjectId, WithId } from 'mongodb'
import { paginationSkip } from '../../utils/queryParams'
import { UserDB } from '../../models/db/db'
import { QueryUser } from '../../models/users/input/query'
import { ExtendedOutputUser, OutputMe, OutputUser, OutputUsers } from '../../models/users/output/output'
import { EmailConfirmation } from '../../models/users/input/create'
import { FilterQuery } from 'mongoose'

export class UsersQueryRepository {
  static async getUsers({
    searchLoginTerm,
    searchEmailTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize
  }: QueryUser): Promise<OutputUsers> {
    let filter: FilterQuery<UserDB> = { isDeleted: false };

    if (searchLoginTerm) {
      filter.$or = [
        { login: { $regex: searchLoginTerm, $options: 'i' } }
      ]
    }

    if (searchEmailTerm) {
      filter.$or = filter.$or || []
      filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } })
    }

    const users = await usersModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)

    const totalCount = await usersModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users.map(this.mapDBUserToOutputUserModel)
    }
  }

  static async getUserById(userID: string): Promise<OutputUser | null> {
    const user = await usersModel.findOne({ _id: new ObjectId(userID) })

    if (!user) {
      return null
    }

    return this.mapDBUserToOutputUserModel(user)
  }

  static async getMe(userID: string): Promise<OutputMe | null> {
    const user = await usersModel.findOne({ _id: new ObjectId(userID) })

    if (!user) {
      return null
    }

    return this.mapDBUserToOutputMeModel(user)
  }

  static async getEmailConfirmationDataByUserId(userId: string): Promise<EmailConfirmation | null> {
    const user = await usersModel.findOne({ _id: new ObjectId(userId) })

    return user?.emailConfirmation || null
  }

  static async getUserByConfirmationCode(confirmationCode: string): Promise<WithId<UserDB> | null> {
    const user = await usersModel.findOne({ 'emailConfirmation.confirmationCode': confirmationCode })

    if (!user) {
      return null
    }

    return user
  }

  static async getUserByLoginOrEmail(loginOrEmail: string, email?: string): Promise<ExtendedOutputUser | null> {
    const user = await usersModel.findOne({
      $or: [
        { login: { $regex: loginOrEmail, $options: 'i' } },
        { email: { $regex: email || loginOrEmail, $options: 'i' } }
      ]
    })

    if (!user) {
      return null
    }

    return this.mapDBUserToOutputUserWithPasswordModel(user)
  }

  static mapDBUserToOutputUserModel(dbUser: WithId<UserDB>): OutputUser {
    return {
      id: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
      createdAt: dbUser.createdAt,
    }
  }

  static mapDBUserToOutputUserWithPasswordModel(dbUser: WithId<UserDB>): ExtendedOutputUser {
    return {
      id: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
      password: dbUser.password,
      passwordSalt: dbUser.passwordSalt,
      emailConfirmation: dbUser.emailConfirmation,
      createdAt: dbUser.createdAt,
    }
  }

  static mapDBUserToOutputMeModel(dbUser: WithId<UserDB>): OutputMe {
    return {
      userId: dbUser._id.toString(),
      login: dbUser.login,
      email: dbUser.email,
    }
  }
}