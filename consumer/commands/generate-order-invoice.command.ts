import { Logger } from '@nestjs/common'
import { DatabaseProvider } from 'common/db/module'
import { OutboxEventData } from 'src/entities'

export class GenerateOrderInvoice {
  private readonly logger = new Logger()

  constructor(
    private readonly db: DatabaseProvider,
    private readonly outboxEvent: OutboxEventData
  ) {}

  async exectue() {
    const invoice = await this.db
      .insertInto('invoices')
      .values({
        id: crypto.randomUUID(),
        order_id: this.outboxEvent.orderId,
        amount: this.outboxEvent.amount.toString()
      })
      .returning('id')
      .executeTakeFirst()

    this.logger.debug(
      `Invoice generated for order ${this.outboxEvent.orderId}, invoiceId: ${invoice?.id}`
    )

    return invoice
  }
}
