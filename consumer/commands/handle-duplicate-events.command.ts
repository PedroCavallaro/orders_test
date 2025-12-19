import { Logger } from '@nestjs/common'
import { DatabaseProvider } from 'common/db'
import { Queue } from 'common/queue'
import { OutboxEventData } from 'src/entities'

export class HandleDuplicateEventsCommand {
  private readonly logger = new Logger()

  constructor(
    private readonly db: DatabaseProvider,
    private readonly outboxEvent: OutboxEventData,
    private readonly queue: Queue<OutboxEventData>
  ) {}

  async execute() {
    const invoice = await this.db
      .selectFrom('invoices')
      .select('id')
      .where('order_id', '=', this.outboxEvent.orderId)
      .executeTakeFirst()

    const event = await this.db
      .selectFrom('processed_events')
      .selectAll()
      .where('event_key', '=', this.outboxEvent.idempotencyKey)
      .executeTakeFirst()

    if (event && event?.queue_attempts >= 5) {
      //Aqui seria interessante enviar pra outro lugar
      this.logger.debug(
        `Max broker attempts reached for event ${event.event_key}`
      )

      this.queue.ack()

      return
    }

    if (!invoice) {
      this.logger.debug(
        `Invoice not yet generated, keeping event on broker ${this.outboxEvent.eventId}`
      )
      return
    }

    if (event?.processed_at) {
      this.logger.debug(
        `Event alreay processed, removindo from broker ${event.event_key}`
      )

      this.queue.ack()

      return
    }

    await this.db
      .updateTable('processed_events')
      .set({
        processed_at: new Date()
      })
      .executeTakeFirst()

    this.logger.debug(`Event processed at updated ${this.outboxEvent.eventId}`)

    this.queue.ack()
  }
}
