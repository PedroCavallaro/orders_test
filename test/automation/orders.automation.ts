import { DatabaseProvider, Order, OrderStatus } from 'common/db'

export async function addRawOrder(order?: Partial<Order>) {
  const db = DatabaseProvider.getInstance()
  return await db
    .insertInto('orders')
    .values({
      id: order?.id ?? crypto.randomUUID(),
      status: order?.status ?? OrderStatus.PENDING,
      amount: order?.amount ?? Math.floor(Math.random() * 2000).toString()
    })
    .executeTakeFirst()
}
