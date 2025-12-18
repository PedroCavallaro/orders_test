import { Injectable } from '@nestjs/common'
import { OrderStatus } from 'common/db/enum'
import { DatabaseProvider } from 'common/db/module/db.provider'
import { OrderPaidEventDTO } from './dto'

@Injectable()
export class OrdersRepository {
  constructor(private readonly db: DatabaseProvider) {}

  async updateOrderToPaid(orderEvent: OrderPaidEventDTO) {
    return await this.db.transaction().execute(async (trx) => {
      const order = await trx
        .updateTable('orders')
        .set({
          status: OrderStatus.PAID
        })
        .where('id', '=', orderEvent.orderId)
        .returning('id')
        .executeTakeFirst()

      const outbox = trx
        .insertInto('outbox_events')
        .values({
          id: orderEvent.eventId,
          event_data: JSON.stringify(orderEvent),
          published: false
        })
        .executeTakeFirst()

      return { order, outbox }
    })
  }

  async getOrder(orderId: string) {
    return await this.db
      .selectFrom('orders')
      .selectAll()
      .where('id', '=', orderId)
      .executeTakeFirst()
  }

  async getAllOrders() {
    return await this.db.selectFrom('orders').selectAll().execute()
  }

  async seed() {
    const promises = Array(30)
      .fill(0)
      .map(() =>
        this.db
          .insertInto('orders')
          .values({
            id: crypto.randomUUID(),
            status: OrderStatus.PENDING,
            amount: Math.floor(Math.random() * 2000).toString()
          })
          .execute()
      )

    await Promise.all(promises)
  }
}
