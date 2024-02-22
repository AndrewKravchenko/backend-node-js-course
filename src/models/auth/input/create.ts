export type AuthLogin = {
  loginOrEmail: 'string',
  password: 'string'
}

export type RegistrationConfirmationCode = {
  code: 'string',
}

export type PasswordChangeData = {
  newPassword: 'string',
  recoveryCode: 'string',
}

export type PasswordRecovery = {
  email: 'string',
}

export type RegistrationEmailResending = {
  email: 'string',
}

export type AccessTokenPayload = {
  userId: string
}

export type RefreshTokenPayload = {
  userId: string
  deviceId: string
}

export type TokenPayload = {
  userId: string
}

export type FreshTokens = {
  accessToken: string
  refreshToken: string
}
