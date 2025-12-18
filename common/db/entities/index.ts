import { OrderEntity } from './order.entity'
import { OutboxEventEntity } from './outbox_events.entity'

export * from './order.entity'
export * from './outbox_events.entity'

export interface Database {
  orders: OrderEntity
  outbox_events: OutboxEventEntity
}
