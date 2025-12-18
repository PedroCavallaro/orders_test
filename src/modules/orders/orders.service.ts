import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { OrderPaidEventDTO } from './dto'
import { OrderEvents } from './enum'
import { OrdersRepository } from './orders.repository'

@Injectable()
export class OrderService {
  private readonly logger = new Logger()

  constructor(private readonly orderRepository: OrdersRepository) {}

  async updateOrderAndAddEvent(orderId: string) {
    const order = await this.orderRepository.getOrder(orderId)

    if (!order) throw new NotFoundException('Order not found')

    const orderEvent = new OrderPaidEventDTO()
      .setType(OrderEvents.ORDER_PAID)
      .setOrder(order.id, Number(order.amount))

    const response = await this.orderRepository.updateOrderToPaid(orderEvent)

    this.logger.debug(`Order ${order.id} changed status to paid`)
  }

  async seed() {
    await this.orderRepository.seed()
  }

  async getAllOrders() {
    return await this.orderRepository.getAllOrders()
  }
}
