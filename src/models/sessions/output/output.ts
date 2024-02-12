export type OutputSession = {
  ip: string
  title: string
  lastActiveDate: string
  deviceId: string
}

export type OutputDetailedSession = {
  id: string
  ip: string
  userId: string
  deviceId: string
  deviceName: string
  expirationAt: string
  lastActiveDate: string
  createdAt: string,
}
