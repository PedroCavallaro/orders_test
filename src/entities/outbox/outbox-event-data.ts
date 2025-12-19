import { OrderEvents } from '../orders'

export class OutboxEventData {
  eventId: string
  eventType: OrderEvents
  orderId: string
  amount: number
  occurredAt?: Date
  idempotencyKey: string

  constructor() {
    this.eventId = crypto.randomUUID()
    this.occurredAt = new Date()
  }

  setType(type: OrderEvents) {
    this.eventType = type

    return this
  }

  setIdepotencyKey() {
    this.idempotencyKey = `${this.orderId}-${this.eventType}`

    return this
  }

  setOrder(id: string, amount: number) {
    this.orderId = id
    this.amount = amount

    return this
  }
}
