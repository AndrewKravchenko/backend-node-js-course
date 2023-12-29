import { Request, Response, NextFunction } from 'express'
import { HttpStatus } from '../../../constants/httpStatus'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers['authorization']

  if (!auth) {
    res.sendStatus(HttpStatus.UNAUTHORIZED)
    return
  }

  const [basic, token] = auth.split(' ')

  if (basic !== 'Basic') {
    res.sendStatus(HttpStatus.UNAUTHORIZED)
    return
  }

  const decodedData = Buffer.from(token, 'base64').toString()
  const [login, password] = decodedData.split(':')

  if (login !== process.env.AUTH_LOGIN || password !== process.env.AUTH_PASSWORD) {
    res.sendStatus(HttpStatus.UNAUTHORIZED)
    return
  }

  next()
}