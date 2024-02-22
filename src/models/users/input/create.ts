export type CreateUser = {
  login: string
  password: string
  email: string
}

export type ExtendedCreateUser = CreateUser & {
  passwordSalt: string
  isDeleted: boolean
  passwordRecovery?: PasswordRecovery
  emailConfirmation?: EmailConfirmation
  createdAt: string
}

export type PasswordRecovery = {
  code: string
  expirationDate: Date
}

export type EmailConfirmation = {
  isConfirmed: boolean
  confirmationCode: string
  expirationDate: Date
}

export type PasswordHashResult = {
  passwordSalt: string;
  passwordHash: string;
}
