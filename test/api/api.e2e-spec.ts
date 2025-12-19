import { INestApplication, LoggerService } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseProvider, OrderStatus } from 'common/db'
import {
  addRawOutboxEvent,
  getOutboxEvent
} from 'test/automation/outbox.automation'
import { AppModule } from '../../src/app.module'
import { doRequest } from '../automation/app.automation'
import { addRawOrder, getOrder } from '../automation/orders.automation'

describe('OrdersController (e2e)', () => {
  let app: INestApplication
  let db: DatabaseProvider

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .setLogger({
        debug(_, ...__) {},
        log(_, ...__) {},
        error(_, ...__) {}
      } as LoggerService)
      .compile()

    app = module.createNestApplication()
    db = module.get(DatabaseProvider)
    await app.init()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /orders/:id/pay', () => {
    it('Should change order status and create event', async () => {
      const order = await addRawOrder()

      await doRequest(app).post(`/orders/${order?.id}/pay`).expect(201)

      const [paidOrder, event] = await Promise.all([
        getOrder(order!.id),
        getOutboxEvent(order!.id)
      ])

      expect(paidOrder).toEqual(
        expect.objectContaining({
          id: order?.id,
          status: OrderStatus.PAID
        })
      )

      expect(event).toEqual(
        expect.objectContaining({
          order_id: order!.id
        })
      )
    })

    it('Should rollback transaction on outbox insert error ', async () => {
      const order = await addRawOrder()
      const event = await addRawOutboxEvent()

      jest
        .spyOn(crypto, 'randomUUID')
        .mockImplementationOnce(() => event?.id as any)

      await doRequest(app).post(`/orders/${order!.id}/pay`).expect(500)

      const orderAfter = await getOrder(order!.id)
      const outbox = await getOutboxEvent(order!.id)

      expect(orderAfter!.status).not.toBe(OrderStatus.PAID)
      expect(outbox).toBe(undefined)
    })

    it('Should throw 404 if order does not exist', async () => {
      await doRequest(app)
        .post(`/orders/${crypto.randomUUID()}/pay`)
        .expect(404)
    })

    it('Should throw forbidden if order is already paid', async () => {
      const order = await addRawOrder()

      await doRequest(app).post(`/orders/${order?.id}/pay`).expect(201)
      await doRequest(app).post(`/orders/${order?.id}/pay`).expect(403)
    })
  })
})
