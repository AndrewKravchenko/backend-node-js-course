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
