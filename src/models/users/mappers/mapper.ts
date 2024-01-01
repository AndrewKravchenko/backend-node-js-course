import { WithId } from 'mongodb'
import { UserDB } from '../../db/db'
import { OutputUser } from '../output/output'

export const userMapper = (postDB: WithId<UserDB>): OutputUser => {
  return {
    id: postDB._id.toString(),
    login: postDB.login,
    email: postDB.email,
    createdAt: postDB.createdAt,
  }
}
