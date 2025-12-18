import { Logger } from '@nestjs/common'
import { DatabaseProvider } from 'common/db'
import { Queue } from 'common/queue'
import { sleep } from 'common/utils'
import { OutboxEventData } from 'src/entities'
import { GenerateOrderInvoice } from './commands'

export class OutboxConsumer {
  private readonly logger = new Logger(OutboxConsumer.name)

  constructor(
    private readonly db: DatabaseProvider,
    private readonly ordersQueue: Queue<OutboxEventData>
  ) {}

  async start() {
    while (true) {
      try {
        const outboxEvent = this.ordersQueue.pop()

        if (!outboxEvent) {
          await sleep(1000)
          continue
        }

        const event = await this.checkForDuplicates(outboxEvent)
        console.log(event)

        if (!event) {
          await sleep(1000)
          continue
        }

        this.logger.debug(
          `Consuming outboxEvent, event: ${outboxEvent.eventId}`
        )

        const command = new GenerateOrderInvoice(this.db, outboxEvent)

        await command.exectue()

        return
        //@ts-ignore
        await this.finishEventProcess(outboxEvent)
      } catch (e) {
        this.logger.error(`Error on outbox consumer ${e}`)
      }
    }
  }

  private async finishEventProcess(outboxEvent: OutboxEventData) {
    await this.db
      .updateTable('processed_events')
      .set({
        processed_at: new Date()
      })
      .where('event_key', '=', outboxEvent.idempotencyKey)
      .execute()
  }

  private async checkForDuplicates(outboxEvent: OutboxEventData) {
    try {
      const event = await this.db
        .insertInto('processed_events')
        .values({
          event_key: outboxEvent.idempotencyKey
        })
        .execute()

      return event
    } catch (e) {
      if (DatabaseProvider.getInstance().isPrimaryKeyError(e)) {
        this.logger.debug(`Duplicate event ${outboxEvent.eventId}`)

        return null
      }

      throw e
    }
  }
}
