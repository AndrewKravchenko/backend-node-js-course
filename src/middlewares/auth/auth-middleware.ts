import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../../constants/httpStatus'
import { JWTService } from '../../services/jwt-service'
import { ObjectId } from 'mongodb'

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
  decodeUserIdFromToken(req, res, () => {
    if (req.userId) {
      next()
    } else {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED)
      return
    }
  })
}

export const decodeUserIdFromToken = (req: Request<{}, {}, {}, any>, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization

  if (!auth) {
    next()
    return
  }

  const token = auth.split(' ')[1]
  const { userId } = JWTService.verifyToken(token) || {}

  if (userId && ObjectId.isValid(userId)) {
    req.userId = userId
  }

  next()
}
