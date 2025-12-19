import { DatabaseProvider, Order } from 'common/db'
import { OrderStatus } from 'src/entities'

export async function addRawOrder(order?: Partial<Order>) {
  const db = DatabaseProvider.getInstance()

  return await db
    .insertInto('orders')
    .values({
      id: order?.id ?? crypto.randomUUID(),
      status: order?.status ?? OrderStatus.PENDING,
      amount: order?.amount ?? Math.floor(Math.random() * 2000).toString()
    })
    .returningAll()
    .executeTakeFirst()
}

export async function getOrder(id: string) {
  const db = DatabaseProvider.getInstance()

  return await db
    .selectFrom('orders')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}
