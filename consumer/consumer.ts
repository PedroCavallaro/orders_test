import { Logger } from '@nestjs/common'
import { DatabaseProvider } from 'common/db'
import { AppManager } from 'common/manager'
import { Queue } from 'common/queue'
import { sleep } from 'common/utils'
import { OutboxEventData } from 'src/entities'
import {
  GenerateOrderInvoiceCommand,
  HandleDuplicateEventsCommand
} from './commands'

export class OutboxConsumer {
  private readonly logger = new Logger(OutboxConsumer.name)

  constructor(
    private readonly db: DatabaseProvider,
    private readonly ordersQueue: Queue<OutboxEventData>
  ) {}

  async start() {
    while (true) {
      await this.tick()
    }
  }

  async tick() {
    try {
      const outboxEvent = this.ordersQueue.pop()

      if (!outboxEvent) {
        await sleep(1000)

        return
      }

      const { duplicate } = await this.checkForDuplicates(outboxEvent)

      if (duplicate) {
        this.logger.debug(`Handling duplicate event ${outboxEvent.eventId}`)

        const command = new HandleDuplicateEventsCommand(
          this.db,
          outboxEvent,
          this.ordersQueue
        )
        await command.execute()

        return
      }

      this.logger.debug(`Consuming outboxEvent, event: ${outboxEvent.eventId}`)

      const command = new GenerateOrderInvoiceCommand(this.db, outboxEvent)
      await command.exectue()

      if (AppManager.getInstance().breakConsumerRandom()) {
        this.logger.error('Break consumer')
        return
      }

      await this.finishEventProcess(outboxEvent)

      this.ordersQueue.ack()
    } catch (e) {
      this.logger.error(`Error on outbox consumer ${e}`)
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
      await this.db
        .insertInto('processed_events')
        .values({
          event_key: outboxEvent.idempotencyKey,
          queue_attempts: 1
        })
        .execute()

      return { duplicate: false }
    } catch (e) {
      if (DatabaseProvider.getInstance().isPrimaryKeyError(e)) {
        return { duplicate: true }
      }

      throw e
    }
  }
}
