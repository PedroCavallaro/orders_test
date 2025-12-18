import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersRepository } from './orders.repository'
import { OrderService } from './orders.service'

@Module({
  imports: [],
  controllers: [OrdersController],
  providers: [OrdersRepository, OrderService]
})
export class OrdersModule {}
