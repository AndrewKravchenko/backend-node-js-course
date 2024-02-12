declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: string;
    deviceId?: string;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      AUTH_LOGIN: string
      AUTH_PASSWORD: string
      MONGO_URI: string
      DB_NAME: string
      JWT_SECRET: string
    }
  }

  namespace Express {
    export interface Request {
      userId: string | null
    }
  }
}

export {}
