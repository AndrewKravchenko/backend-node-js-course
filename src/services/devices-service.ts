import { HTTP_STATUS } from '../constants/httpStatus'
import { SessionsRepository } from '../repositories/sessions-repository'
import { SessionsQueryRepository } from '../repositories/query/sessions-query-repository'
import { OutputSession } from '../models/sessions/output/output'
import { AuthService } from './auth-service'

export class DevicesService {
  static async getSessions(refreshToken?: string): Promise<{ code: HTTP_STATUS; data?: OutputSession[] }> {
    const { verifiedRefreshToken, isActiveSession } = await AuthService.verifyRefreshTokenAndCheckCurrentSession(refreshToken)

    if (!verifiedRefreshToken || !isActiveSession) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const data = await SessionsQueryRepository.getSessionsByUserId(verifiedRefreshToken.userId)

    return { code: HTTP_STATUS.OK, data }
  }

  static async deleteSession(deviceId?: string, refreshToken?: string): Promise<{ code: HTTP_STATUS }> {
    if (!deviceId) {
      return { code: HTTP_STATUS.NOT_FOUND }
    }

    const { verifiedRefreshToken, isActiveSession } = await AuthService.verifyRefreshTokenAndCheckCurrentSession(refreshToken)

    if (!verifiedRefreshToken || !isActiveSession) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const session = await SessionsRepository.getDetailedSessionByDeviceId(deviceId)

    if (!session) {
      return { code: HTTP_STATUS.NOT_FOUND }
    }

    if (session.userId !== verifiedRefreshToken.userId) {
      return { code: HTTP_STATUS.FORBIDDEN }
    }

    const isDeleted = await SessionsRepository.deleteSessionByDeviceId(deviceId)

    if (isDeleted) {
      return { code: HTTP_STATUS.NO_CONTENT }
    } else {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }
  }

  static async deleteSessions(refreshToken?: string): Promise<{ code: HTTP_STATUS }> {
    const { verifiedRefreshToken, isActiveSession } = await AuthService.verifyRefreshTokenAndCheckCurrentSession(refreshToken)

    if (!verifiedRefreshToken || !isActiveSession) {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }

    const isDeleted = await SessionsRepository.deleteSessions(verifiedRefreshToken.userId, verifiedRefreshToken.deviceId!)
    if (isDeleted) {
      return { code: HTTP_STATUS.NO_CONTENT }
    } else {
      return { code: HTTP_STATUS.UNAUTHORIZED }
    }
  }
}
