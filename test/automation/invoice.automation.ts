import { DatabaseProvider, InvoiceEntity } from 'common/db'
import { addRawOrder } from './orders.automation'

export async function addRawInvoice(invoice: Partial<InvoiceEntity>) {
  const db = DatabaseProvider.getInstance()
  const order = await addRawOrder()

  return await db
    .insertInto('invoices')
    .values({
      id: crypto.randomUUID(),
      order_id: invoice?.order_id ?? order!.id,
      amount: invoice?.amount ?? order!.amount
    })
    .returningAll()
    .executeTakeFirst()
}

export async function getInvoice(id: string) {
  const db = DatabaseProvider.getInstance()

  return await db
    .selectFrom('invoices')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}
export async function getInvoiceByOrderId(orderId: string) {
  const db = DatabaseProvider.getInstance()

  return await db
    .selectFrom('invoices')
    .selectAll()
    .where('order_id', '=', orderId)
    .executeTakeFirst()
}
