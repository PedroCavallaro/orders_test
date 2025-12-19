import { DatabaseProvider } from 'common/db'
import { Queue } from 'common/queue'
import { OrderEvents, OutboxEventData } from 'src/entities'
import { addRawInvoice } from 'test/automation/invoice.automation'
import { addRawOrder } from 'test/automation/orders.automation'
import {
  addRawProcessedEvent,
  getProcessedEvent
} from 'test/automation/processed-events.automation'
import { HandleDuplicateEventsCommand } from './handle-duplicate-events.command'

jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common')

  return {
    ...original,
    Logger: jest.fn().mockImplementation(() => ({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn()
    }))
  }
})
describe('HandleDuplicateEventsCommand', () => {
  let db: DatabaseProvider
  let queue: jest.Mocked<Queue<OutboxEventData>>

  beforeAll(async () => {
    db = DatabaseProvider.getInstance()
  })

  beforeEach(() => {
    queue = {
      ack: jest.fn()
    } as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const outboxEventMock: OutboxEventData = {
    eventId: '54c8a9b4-8f5b-4d2d-8406-9b68737fec9f',
    eventType: OrderEvents.ORDER_PAID,
    orderId: '930ff914-c774-4420-87f1-70f28b691fc5',
    amount: 1659,
    occurredAt: new Date(),
    idempotencyKey: '930ff914-c774-4420-87f1-70f28b691fc5-OrderPaid'
  } as OutboxEventData

  it('Should ack event when max queue attempts reached', async () => {
    const order = await addRawOrder()
    await addRawInvoice({
      order_id: order!.id,
      amount: order!.amount
    })

    const processedEvent = await addRawProcessedEvent({
      event_key: `${order!.id}-${OrderEvents.ORDER_PAID}`,
      queue_attempts: 5
    })

    const outboxEvent: OutboxEventData = {
      ...outboxEventMock,
      idempotencyKey: processedEvent!.event_key,
      orderId: order!.id,
      amount: Number(order!.amount)
    } as OutboxEventData

    const command = new HandleDuplicateEventsCommand(db, outboxEvent, queue)

    await command.execute()

    expect(queue.ack).toHaveBeenCalled()
  })

  it('Should keep event in queue when invoice does not exist', async () => {
    const order = await addRawOrder()
    const eventKey = `${order!.id}-${OrderEvents.ORDER_PAID}`

    await addRawProcessedEvent({
      event_key: eventKey
    })

    const outboxEvent: OutboxEventData = {
      ...outboxEventMock,
      orderId: order!.id,
      idempotencyKey: `${order!.id}-${OrderEvents.ORDER_PAID}`,
      amount: Number(order!.amount)
    } as OutboxEventData

    const command = new HandleDuplicateEventsCommand(db, outboxEvent, queue)

    await command.execute()

    expect(queue.ack).not.toHaveBeenCalled()
  })

  it('Should ack event if already processed', async () => {
    const order = await addRawOrder()
    await addRawInvoice({
      order_id: order!.id,
      amount: order!.amount
    })

    const processedEvent = await addRawProcessedEvent({
      event_key: `${order!.id}-${OrderEvents.ORDER_PAID}`,
      processed_at: new Date()
    })

    const outboxEvent: OutboxEventData = {
      ...outboxEventMock,
      orderId: order!.id,
      idempotencyKey: processedEvent!.event_key,
      amount: Number(order!.amount)
    } as OutboxEventData

    const command = new HandleDuplicateEventsCommand(db, outboxEvent, queue)

    await command.execute()

    expect(queue.ack).toHaveBeenCalled()
  })

  it('Should mark event as processed and ack queue', async () => {
    const order = await addRawOrder()
    await addRawInvoice({
      order_id: order!.id,
      amount: order!.amount
    })

    const processedEvent = await addRawProcessedEvent({
      event_key: `${order!.id}-${OrderEvents.ORDER_PAID}`
    })

    const outboxEvent: OutboxEventData = {
      ...outboxEventMock,
      orderId: order!.id,
      idempotencyKey: processedEvent!.event_key,
      amount: Number(order!.amount)
    } as OutboxEventData

    const command = new HandleDuplicateEventsCommand(db, outboxEvent, queue)

    await command.execute()

    const updatedEvent = await getProcessedEvent(processedEvent!.event_key)

    expect(updatedEvent!.processed_at).toBeInstanceOf(Date)
    expect(queue.ack).toHaveBeenCalled()
  })
})
