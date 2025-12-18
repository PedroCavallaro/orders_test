import { Controller, Get, Param, Post } from '@nestjs/common'
import { OrderService } from './orders.service'

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getOrders() {
    return await this.orderService.getAllOrders()
  }

  @Post('/seed')
  async seed() {
    await this.orderService.seed()
  }

  @Post('/:id/pay')
  async payOrder(@Param('id') orderId: string) {
    const response = await this.orderService.updateOrderAndAddEvent(orderId)

    return response
  }
}
