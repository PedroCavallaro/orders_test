import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'
import { doRequest } from '../automation/app.automation'
import { addRawOrder } from '../automation/orders.automation'

describe('OrdersController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /orders/:id/pay', () => {
    it('POST /orders/:id/pay', async () => {
      const order = await addRawOrder()

      const response = await doRequest(app)
        .post(`/orders/${order.insertId}/pay`)
        .expect(201)
    })
  })
})
