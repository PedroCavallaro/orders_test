import { DatabaseProvider, OutboxEvent } from 'common/db'
import { Queue } from 'common/queue'
import { OutboxEventData } from 'src/entities'
import { addRawOrder } from 'test/automation/orders.automation'
import {
  addRawOutboxEvent,
  getOutboxEvent
} from 'test/automation/outbox.automation'
import { PublishOrderCommand } from './publish-order.command'

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
describe('PublishOrderCommand', () => {
  let db: DatabaseProvider
  let queue: Queue<OutboxEventData>

  const outboxEvent = {
    event_data: JSON.stringify({
      eventId: '04f03364-f684-43ba-af4d-0dbe42d47c4f',
      eventType: 'OrderPaid',
      orderId: 'a63214dc-2ceb-463e-ad55-f84141eff891',
      amount: 276,
      occurredAt: '2025-12-19T01:56:38.631Z',
      idempotencyKey: 'a63214dc-2ceb-463e-ad55-f84141eff891-OrderPaid'
    })
  } as OutboxEvent

  beforeAll(() => {
    queue = {
      add: jest.fn(),
      ack: jest.fn(),
      pop: jest.fn()
    } as any

    db = DatabaseProvider.getInstance()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should publish event and mark as published', async () => {
    const order = await addRawOrder()
    const event = await addRawOutboxEvent({
      order_id: order!.id
    })

    const command = new PublishOrderCommand(event!, db, queue)

    await command.execute()

    const updatedOutboxEvent = await getOutboxEvent(event!.order_id)

    expect(queue.add).toHaveBeenCalledWith(JSON.parse(event!.event_data))
    expect(updatedOutboxEvent).toEqual(
      expect.objectContaining({
        id: event!.id,
        published: true
      })
    )
  })

  it('should retry until success', async () => {
    let count = 0

    jest
      .spyOn(PublishOrderCommand.prototype, 'addOnBrokerAndUpdateEvent')
      .mockImplementationOnce(async () => {
        if (count == 2) return
        count++

        throw new Error('Test error')
      })

    const command = new PublishOrderCommand(outboxEvent, db, queue)

    await command.execute()

    expect(queue.add).toHaveBeenCalled()
  })
})
