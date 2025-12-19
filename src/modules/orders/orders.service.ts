import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { OrderStatus } from 'common/db'
import { OrderEvents, OutboxEventData } from 'src/entities'
import { OrdersRepository } from './orders.repository'

@Injectable()
export class OrderService {
  private readonly logger = new Logger()

  constructor(private readonly orderRepository: OrdersRepository) {}

  async updateOrderAndAddEvent(orderId: string) {
    try {
      const order = await this.orderRepository.getOrder(orderId)

      if (!order) throw new NotFoundException('Order not found')

      if (order.status == OrderStatus.PAID)
        throw new ForbiddenException('Order is already paid')

      const orderEvent = new OutboxEventData()
        .setType(OrderEvents.ORDER_PAID)
        .setOrder(order.id, Number(order.amount))
        .setIdempotencyKey()

      await this.orderRepository.updateOrderAndAddEvent(orderEvent)

      this.logger.debug(`Order ${order.id} changed status to paid`)
    } catch (error) {
      if (error instanceof HttpException) throw error

      this.logger.error(
        `Error while changing order ${orderId} status: ${error}`
      )

      throw new InternalServerErrorException()
    }
  }

  async seed() {
    await this.orderRepository.seed()
  }

  async getAllOrders() {
    return await this.orderRepository.getAllOrders()
  }
}
