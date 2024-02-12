import { Request, Response, Router } from 'express'
import { DeviceId, RequestWithParams } from '../models/common'
import { DevicesService } from '../services/devices-service'

export const devicesRouter = Router({})

devicesRouter.get('/devices', async (req: Request, res: Response) => {
  const { code, data } = await DevicesService.getSessions(req.cookies.refreshToken)
  res.status(code).send(data)
})


devicesRouter.delete('/devices/:deviceId', async (req: RequestWithParams<DeviceId>, res: Response) => {
  const deviceId = req.params.deviceId
  const refreshToken = req.cookies.refreshToken
  const { code } = await DevicesService.deleteSession(deviceId, refreshToken)

  res.sendStatus(code)
})

devicesRouter.delete('/devices', async (req: Request, res: Response) => {
  const { code } = await DevicesService.deleteSessions(req.cookies.refreshToken)
  res.sendStatus(code)
})