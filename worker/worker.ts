import { Logger } from '@nestjs/common'
import { Database, DatabaseProvider, OutboxEvent } from 'common/db'
import { Queue } from 'common/queue'
import { sleep } from 'common/utils'
import { Transaction } from 'kysely'
import { OutboxEventData } from 'src/entities'
import { PublishOrderCommand } from './commands'

export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name)
  private running = true

  constructor(
    private readonly db: DatabaseProvider,
    private readonly queue: Queue<OutboxEventData>
  ) {}

  async start() {
    while (this.running) {
      await this.tick()
    }
  }

  async tick() {
    try {
      const outboxEvent: OutboxEvent | undefined = await this.db
        .transaction()
        .execute(this.getOutboxEvent)

      if (!outboxEvent) {
        await sleep(1000)

        return
      }

      await this.proccessOutboxEvent(outboxEvent)
    } catch (error) {
      this.logger.error(`Error on outbox worker ${error}`)

      await sleep(10000)
    }
  }

  private async getOutboxEvent(trx: Transaction<Database>) {
    const outboxEvent = await trx
      .selectFrom('outbox_events')
      .selectAll()
      .where('published', '=', false)
      .where('dead', '=', false)
      .forUpdate()
      .skipLocked()
      .limit(1)
      .executeTakeFirst()

    if (!outboxEvent) {
      return undefined
    }

    return outboxEvent
  }

  private async proccessOutboxEvent(outboxEvent: OutboxEvent) {
    this.logger.debug(`Start processing event: ${outboxEvent.id}`)

    const command = new PublishOrderCommand(outboxEvent, this.db, this.queue)

    await command.execute()
  }
}
