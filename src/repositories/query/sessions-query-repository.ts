import { WithId } from 'mongodb'
import { OutputSession } from '../../models/sessions/output/output'
import { SessionsDB } from '../../models/db/db'
import { sessionsCollection } from '../../db/db'

export class SessionsQueryRepository {
  static async getSessionsByUserId(userId: string): Promise<OutputSession[]> {
    const sessions = await sessionsCollection.find({
      userId,
      expirationAt: { $gt: new Date().toISOString() }
  }).toArray()

    return sessions.map(this.mapDBSessionToOutputSessionModel)
  }

  static mapDBSessionToOutputSessionModel(dbSession: WithId<SessionsDB>): OutputSession {
    return {
      ip: dbSession.ip,
      title: dbSession.deviceName,
      lastActiveDate: dbSession.expirationAt,
      deviceId: dbSession.deviceId,
    }
  }
}
