import { OrderEvents } from '../enum'

export class OrderPaidEventDTO {
  eventId: string
  eventType: OrderEvents
  orderId: string
  amount: number
  occurredAt?: Date

  constructor() {
    this.eventId = crypto.randomUUID()
  }

  setType(type: OrderEvents) {
    this.eventType = type

    return this
  }
  setOrder(id: string, amount: number) {
    this.orderId = id
    this.amount = amount

    return this
  }
}
