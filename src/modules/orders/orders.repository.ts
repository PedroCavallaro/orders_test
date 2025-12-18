import { Injectable } from '@nestjs/common'
import { OrderStatus } from 'common/db/enum'
import { DatabaseProvider } from 'common/db/module/db.provider'
import { OutboxEventData } from 'src/entities'

@Injectable()
export class OrdersRepository {
  constructor(private readonly db: DatabaseProvider) {}

  async updateOrderAndAddEvent(outboxEvent: OutboxEventData) {
    try {
      return await this.db.transaction().execute(async (trx) => {
        const order = await trx
          .updateTable('orders')
          .set({
            status: OrderStatus.PAID
          })
          .where('id', '=', outboxEvent.orderId)
          .returning('id')
          .executeTakeFirst()

        const outbox = trx
          .insertInto('outbox_events')
          .values({
            id: outboxEvent.eventId,
            event_data: JSON.stringify(outboxEvent),
            published: false,
            dead: false
          })
          .executeTakeFirst()

        return { order, outbox }
      })
    } catch (error) {
      return null
    }
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
