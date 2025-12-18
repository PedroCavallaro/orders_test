import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from 'common/db/module/db.module'
import { AppController } from './app.controller'
import { OrdersModule } from './modules/orders'

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, OrdersModule],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
