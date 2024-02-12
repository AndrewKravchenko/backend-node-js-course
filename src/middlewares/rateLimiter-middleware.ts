import { NextFunction, Request, Response } from 'express'
import { RequestLogsRepository } from '../repositories/requestLogs-repository'
import { HTTP_STATUS } from '../constants/httpStatus'

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const { ip = '', originalUrl } = req
  const currentTime = new Date().getTime()
  const tenSecondsAgo = new Date(currentTime - 10 * 1000)

  const requestCount = await RequestLogsRepository.getRequestLogs({
    ip, url: originalUrl, date: tenSecondsAgo
  })

  if (requestCount >= 5) {
    res.sendStatus(HTTP_STATUS.TOO_MANY_REQUESTS)
    return
  }

  await RequestLogsRepository.createRequestLogs({
    ip,
    url: originalUrl,
    date: new Date(),
    createdAt: new Date().toISOString()
  })

  next()
}
