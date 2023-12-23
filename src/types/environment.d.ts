declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      AUTH_LOGIN: string
      AUTH_PASSWORD: string
      MONGO_URI: string
      DB_NAME: string
    }
  }
}

export {}
