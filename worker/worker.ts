import { Logger } from '@nestjs/common'
import { OutboxEvent } from 'common'
import { DatabaseProvider } from 'common/db/module'
import { Queue } from 'common/queue/queue'
import { sleep } from 'common/utils'
import { PublishOrderCommand } from './commands'

export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name)

  constructor(
    private readonly db: DatabaseProvider,
    private readonly queue: Queue<OutboxEvent>
  ) {}

  async start() {
    while (true) {
      const outboxEvent = await this.db
        .selectFrom('outbox_events')
        .selectAll()
        .where('published', '=', false)
        .executeTakeFirst()

      if (!outboxEvent) {
        console.log('oioi')
        await sleep(10000)

        continue
      }

      await sleep(10000)
      this.logger.debug(`start processing event: ${outboxEvent.id}`)

      const command = new PublishOrderCommand(outboxEvent, this.db, this.queue)

      await command.execute()
    }
  }
}
