import jwt, { JwtPayload } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { AccessTokenPayload, FreshTokens, RefreshTokenPayload, TokenPayload } from '../models/auth/input/create'

export class JWTService {
  static generateAccessToken(payload: TokenPayload) {
    const accessTokenPayload: AccessTokenPayload = payload

    return jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {
        expiresIn: 10000,
        issuer: 'api.blogs.com',
        audience: 'blogs.com',
      }
    )
  }

  static async generateRefreshToken(payload: TokenPayload, deviceId?: string) {
    const expiresInSeconds = 20000
    const refreshTokenPayload: RefreshTokenPayload = {
      ...payload,
      deviceId: deviceId || uuidv4(),
    }

    return jwt.sign(refreshTokenPayload, process.env.JWT_SECRET, {
      expiresIn: expiresInSeconds,
      issuer: 'api.blogs.com',
      audience: 'blogs.com',
    })
  }

  static async generateTokens(payload: TokenPayload, deviceId?: string): Promise<FreshTokens> {
    const refreshToken = await this.generateRefreshToken(payload, deviceId)
    const accessToken = this.generateAccessToken(payload)

    return {
      accessToken,
      refreshToken
    }
  }

  static verifyToken(token?: string): JwtPayload | null {
    if (!token) {
      return null
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)

      if (typeof payload !== 'object') {
        return null
      }

      return payload
    } catch (e) {
      return null
    }
  }

  static decodeToken(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload
  }
}