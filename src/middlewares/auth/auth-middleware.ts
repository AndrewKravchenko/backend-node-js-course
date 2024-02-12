import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../../constants/httpStatus'
import { JWTService } from '../../services/jwt-service'

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization

  if (!auth) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
    return
  }

  const [basic, token] = auth.split(' ')

  if (basic !== 'Basic') {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
    return
  }

  const decodedData = Buffer.from(token, 'base64').toString()
  const [login, password] = decodedData.split(':')

  if (login !== process.env.AUTH_LOGIN || password !== process.env.AUTH_PASSWORD) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
    return
  }

  next()
}

export const bearerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization

  if (!auth) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
    return
  }

  const token = auth.split(' ')[1]
  const accessTokenPayload = JWTService.verifyToken(token)

  if (accessTokenPayload?.userId) {
    req.userId = accessTokenPayload.userId
    return next()
  }

  res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
  return
}
