export type AuthLogin = {
  loginOrEmail: 'string',
  password: 'string'
}

export type RegistrationConfirmationCode = {
  code: 'string',
}

export type RegistrationEmailResending = {
  email: 'string',
}

export type AccessTokenPayload = {
  userId: string
  type: 'access'
}

export type RefreshTokenPayload = {
  userId: string
  tokenType: 'refresh'
}

export type TokenPayload = {
  userId: string
}

export type FreshTokens = {
  accessToken: string
  refreshToken: string
}
