import { InvoiceEntity } from './invoices.entity'
import { OrderEntity } from './order.entity'
import { OutboxEventEntity } from './outbox-events.entity'
import { ProcessedEventsEntity } from './processed-events.entity'

export * from './order.entity'
export * from './outbox-events.entity'
export * from './processed-events.entity'
export * from './invoices.entity'

export interface Database {
  invoices: InvoiceEntity
  processed_events: ProcessedEventsEntity
  orders: OrderEntity
  outbox_events: OutboxEventEntity
}
