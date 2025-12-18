import { Global, Module } from '@nestjs/common'
import { DatabaseProvider } from './db.provider'

@Global()
@Module({
  providers: [
    {
      provide: DatabaseProvider,
      useValue: DatabaseProvider.getInstance()
    }
  ],
  exports: [DatabaseProvider]
})
export class DatabaseModule {}
