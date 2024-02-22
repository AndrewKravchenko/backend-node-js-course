import { sessionsModel } from '../db/db'
import { WithId } from 'mongodb'
import { CreateSession } from '../models/sessions/input/create'
import { SessionsDB } from '../models/db/db'
import { OutputDetailedSession } from '../models/sessions/output/output'
import { UpdateSession } from '../models/sessions/input/update'

export class SessionsRepository {
  static async getDetailedSessionByDeviceId(deviceId: string): Promise<OutputDetailedSession | null> {
    const session = await sessionsModel.findOne({ deviceId })

    if (!session) {
      return null
    }

    return this.mapDBSessionToOutputDetailedSessionModel(session)
  }

  static async getDetailedSession(userId: string, deviceId: string): Promise<OutputDetailedSession | null> {
    const session = await sessionsModel.findOne({ userId, deviceId })

    if (!session) {
      return null
    }

    return this.mapDBSessionToOutputDetailedSessionModel(session)
  }

  static async createSession(newSession: CreateSession): Promise<string> {
    const { _id } = await sessionsModel.create(newSession)

    return _id.toString()
  }

  static async refreshSession(userId: string, deviceId: string, updatedSession: UpdateSession): Promise<boolean> {
    const { ip, expirationAt, lastActiveDate } = updatedSession
    const result = await sessionsModel.updateOne(
      { userId, deviceId },
      {
        $set: {
          ip,
          expirationAt,
          lastActiveDate,
        },
      }
    )

    return !!result.matchedCount
  }

  static async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const result = await sessionsModel.deleteOne({ deviceId })

    return !!result.deletedCount
  }

  static async deleteOldestSession(userId: string): Promise<boolean> {
    const result = await sessionsModel.deleteOne({
      userId,
      expirationAt: { $lt: new Date().toISOString() }
    })

    return !!result.deletedCount
  }

  static async deleteSessions(userId: string, activeSessionDeviceId: string): Promise<boolean> {
    const result = await sessionsModel.deleteMany({ userId, deviceId: { $ne: activeSessionDeviceId } })

    return !!result.deletedCount
  }

  static mapDBSessionToOutputDetailedSessionModel(dbSession: WithId<SessionsDB>): OutputDetailedSession {
    return {
      id: dbSession._id.toString(),
      ip: dbSession.ip,
      userId: dbSession.userId,
      deviceId: dbSession.deviceId,
      deviceName: dbSession.deviceName,
      lastActiveDate: dbSession.lastActiveDate,
      expirationAt: dbSession.expirationAt,
      createdAt: dbSession.createdAt,
    }
  }
}
