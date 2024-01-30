import { sessionsCollection } from '../db/db'
import { ObjectId } from 'mongodb'
import { RefreshSession } from '../models/sessions/input/create'
import { Session, SessionsDB } from '../models/db/db'

export class SessionsRepository {
  static async getUserSessions(userId: string): Promise<Session[]> {
    const existingSessions = await sessionsCollection.findOne({ _id: new ObjectId(userId) })

    return existingSessions?.sessions || []
  }

  static async getSession(userId: string, refreshTokenId: string): Promise<Session | null> {
    const existingSessions = await sessionsCollection.findOne({ _id: new ObjectId(userId) })

    if (existingSessions) {
      return existingSessions.sessions.find((session) => session.refreshTokenId === refreshTokenId) || null
    }

    return null
  }

  static async addSession(userId: string, newSession: RefreshSession): Promise<string> {
    const userIdObjectId = new ObjectId(userId)
    const existingSessions = await sessionsCollection.findOne({ _id: userIdObjectId })

    const updatedSessionsDB: SessionsDB = existingSessions || { sessions: [] }
    updatedSessionsDB.sessions.push(newSession)

    await sessionsCollection.updateOne(
      { _id: userIdObjectId },
      { $set: updatedSessionsDB },
      { upsert: true }
    )

    return userIdObjectId.toString()
  }

  static async deleteSession(userId: string, refreshTokenId: string): Promise<boolean> {
    const userIdObjectId = new ObjectId(userId)
    const existingSessions = await sessionsCollection.findOne({ _id: userIdObjectId })

    if (existingSessions) {
      existingSessions.sessions = existingSessions.sessions.filter(session => session.refreshTokenId !== refreshTokenId)

      await sessionsCollection.updateOne(
        { _id: userIdObjectId },
        { $set: { sessions: existingSessions.sessions } }
      )

      return true
    } else {
      return false
    }
  }

  static async deleteOldestSession(userId: string): Promise<boolean> {
    const sessions = await this.getUserSessions(userId)

    if (sessions.length > 0) {
      sessions.splice(0, 1)

      await sessionsCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { sessions } }
      )

      return true
    }
    return false
  }
}
