import { Logger } from '@nestjs/common'
import { DatabaseProvider } from 'common/db/module'
import { OrderPaidEventDTO } from 'src/modules/orders/dto'

export class GenerateOrderInvoice {
  private readonly logger = new Logger()
  private readonly db: DatabaseProvider

  constructor(private readonly orderEvent: OrderPaidEventDTO) {
    this.db = DatabaseProvider.getInstance()
  }

  async exectue() {}
}
