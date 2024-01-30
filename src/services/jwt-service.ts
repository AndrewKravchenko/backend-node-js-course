import jwt, { JwtPayload } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { AccessTokenPayload, FreshTokens, RefreshTokenPayload, TokenPayload } from '../models/auth/input/create'
import { SessionsRepository } from '../repositories/sessions-repository'

export class JWTService {
  static generateAccessToken(payload: TokenPayload) {
    const accessTokenPayload: AccessTokenPayload = {
      ...payload,
      type: 'access'
    }

    return jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {
        expiresIn: 10,
        issuer: 'api.blogs.com',
        audience: 'blogs.com',
      }
    )
  }

  static async generateRefreshToken(payload: TokenPayload) {
    const jwtid = uuidv4()
    const refreshTokenPayload: RefreshTokenPayload = {
      ...payload,
      tokenType: 'refresh',
    }

    const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_SECRET, {
      expiresIn: 20,
      issuer: 'api.blogs.com',
      audience: 'blogs.com',
      jwtid,
    })
    const newSession = {
      refreshTokenId: jwtid,
      createdAt: new Date().toISOString(),
    }

    await SessionsRepository.addSession(payload.userId, newSession)

    return refreshToken
  }

  static async generateTokens(payload: TokenPayload): Promise<FreshTokens> {
    const refreshToken = await this.generateRefreshToken(payload)
    const accessToken = this.generateAccessToken(payload)

    return {
      accessToken,
      refreshToken
    }
  }

  static decodeToken(token: string): JwtPayload & Partial<AccessTokenPayload | RefreshTokenPayload> | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
    } catch (e) {
      return null
    }
  }
}