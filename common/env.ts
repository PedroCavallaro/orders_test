import * as dotenv from 'dotenv'

dotenv.config({
  quiet: true
})

class Env {
  static getEnv() {
    return {
      app: {
        port: Number(process.env.PORT) ?? 3000,
        nodeEnv: process.env.NODE_ENV
      },
      db: {
        host: process.env.DB_HOST ?? '127.0.0.1',
        name: process.env.DB_NAME ?? 'orders',
        password: process.env.DB_PASSWORD ?? 'orders',
        user: process.env.DB_USER ?? 'orders',
        port: Number(process.env.DB_PORT) ?? 5432
      }
    }
  }
}

export const env = Env.getEnv()
