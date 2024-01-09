import jwt, { JwtPayload } from 'jsonwebtoken'

export class jwtService {
  static createJWT(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
  }

  static getUserIdByToken(token: string): string | null {
    try {
      const result = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
      return result.userId
    } catch (e) {
      return null
    }
  }
}