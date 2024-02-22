import { EmailConfirmation, PasswordRecovery } from '../input/create'
import { PaginatedData } from '../../common'

export type OutputUsers = PaginatedData<OutputUser>

export type OutputMe = {
  userId: string,
  login: string,
  email: string,
}

export type OutputUser = {
  id: string,
  login: string,
  email: string,
  createdAt: string,
}

export type ExtendedOutputUser = OutputUser & {
  password: string
  passwordSalt: string
  passwordRecovery?: PasswordRecovery
  emailConfirmation?: EmailConfirmation
}
