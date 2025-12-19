import { DatabaseProvider } from 'common/db'
import { OrderEvents, OutboxEventData } from 'src/entities'
import { getInvoiceByOrderId } from 'test/automation/invoice.automation'
import { addRawOrder } from 'test/automation/orders.automation'
import { GenerateOrderInvoiceCommand } from './generate-order-invoice.command'

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

describe('GenerateOrderInvoiceCommand', () => {
  let db: DatabaseProvider

  beforeAll(async () => {
    db = DatabaseProvider.getInstance()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const outboxEvent: OutboxEventData = {
    eventId: '54c8a9b4-8f5b-4d2d-8406-9b68737fec9f',
    eventType: OrderEvents.ORDER_PAID,
    orderId: '930ff914-c774-4420-87f1-70f28b691fc5',
    amount: 1659,
    occurredAt: new Date(),
    idempotencyKey: '930ff914-c774-4420-87f1-70f28b691fc5-OrderPaid'
  } as OutboxEventData

  it('Should generate invoice for order', async () => {
    const order = await addRawOrder()
    outboxEvent.orderId = order!.id

    const command = new GenerateOrderInvoiceCommand(db, outboxEvent)

    const invoice = await command.exectue()

    const savedInvoice = await getInvoiceByOrderId(order!.id)

    expect(savedInvoice).toEqual(
      expect.objectContaining({
        id: invoice!.id,
        order_id: order!.id
      })
    )
  })
})
