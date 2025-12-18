import { Injectable } from '@nestjs/common'
import { env } from 'common/env'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Database } from '../entities'

@Injectable()
export class DatabaseProvider extends Kysely<Database> {
  static instance: DatabaseProvider

  private constructor() {
    super({
      dialect: new PostgresDialect({
        pool: new Pool({
          database: env.db.name,
          host: env.db.host,
          user: env.db.user,
          password: env.db.password,
          port: env.db.port,
          max: 10
        })
      })
    })
  }

  isPrimaryKeyError(e: any) {
    return e?.code == 23505
  }

  static getInstance() {
    if (!DatabaseProvider.instance) {
      DatabaseProvider.instance = new DatabaseProvider()

      return DatabaseProvider.instance
    }

    return DatabaseProvider.instance
  }
}
