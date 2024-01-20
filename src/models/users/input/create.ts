export type CreateUser = {
  login: string
  password: string
  email: string
}

export type ExtendedCreateUser = CreateUser & {
  passwordSalt: string
  isDeleted: boolean
  emailConfirmation?: EmailConfirmation
  createdAt: string
}

export type EmailConfirmation = {
  isConfirmed: boolean
  confirmationCode: string
  expirationDate: Date
}
