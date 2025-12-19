import { DatabaseProvider } from 'common/db'
import { Queue } from 'common/queue'
import { addRawOrder } from 'test/automation/orders.automation'
import {
  addRawOutboxEvent,
  getOutboxEvent
} from 'test/automation/outbox.automation'
import { HandlePublishFailureCommand } from './handle-publish-failure'

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
describe('HandlePublishFailureCommand', () => {
  let db: DatabaseProvider

  beforeAll(async () => {
    db = DatabaseProvider.getInstance()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should mark outbox event as dead and send to DLQ', async () => {
    const order = await addRawOrder()
    const event = await addRawOutboxEvent({
      order_id: order!.id,
      dead: false
    })

    const failureReason = new Error('max retries reached')
    const queueAddSpy = jest.spyOn(Queue.prototype, 'add')

    const command = new HandlePublishFailureCommand(event!, db, failureReason)
    await command.execute()

    const updatedOutboxEvent = await getOutboxEvent(order!.id)

    expect(updatedOutboxEvent).toEqual(
      expect.objectContaining({
        id: event!.id,
        dead: true
      })
    )

    expect(queueAddSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: event!.id,
        failureReason
      })
    )
  })
})
