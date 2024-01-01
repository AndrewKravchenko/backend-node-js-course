export type CreateUser = {
  login: string,
  password: string,
  email: string,
}

export type ExtendedCreateUser = CreateUser & {
  passwordSalt: string;
  isDeleted: boolean;
  createdAt: string;
}
