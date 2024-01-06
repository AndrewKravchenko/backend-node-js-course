const authLogin = process.env.AUTH_LOGIN || ''
const authPassword = process.env.AUTH_PASSWORD || ''

export const authCredentials: [string, string] = [authLogin, authPassword]
