import { Logger } from '@nestjs/common'
import { DatabaseProvider, OutboxEvent } from 'common/db'
import { AppManager, AppManagerError } from 'common/manager'
import { Queue } from 'common/queue'
import { sleep } from 'common/utils'
import { backoff } from 'common/utils/backoff'
import { OutboxEventData } from 'src/entities'
import { HandlePublishFailureCommand } from './handle-publish-failure'

export class PublishOrderCommand {
  private readonly logger = new Logger(PublishOrderCommand.name)

  constructor(
    private readonly outboxEvent: OutboxEvent,
    private readonly db: DatabaseProvider,
    private readonly queue: Queue<OutboxEventData>
  ) {}

  async execute(attempt = 1, timeout = 1000): Promise<any> {
    try {
      if (attempt < AppManager.getInstance().successOnAttempt) {
        throw new Error('Testing retry')
      }

      const response = await this.addOnBrokerAndUpdateEvent()

      this.logger.debug(`Event published ${this.outboxEvent.id}`)

      return response
    } catch (e: unknown) {
      if (attempt >= 5) return this.onMaxRetries(e)

      if (e instanceof AppManagerError) return

      this.logger.error(
        `Error publishing outbox event ${this.outboxEvent.id} ${e}`
      )

      const ms = backoff(attempt)

      this.logger.debug(`sleeping ${ms}`)

      await sleep(ms)

      return this.execute((attempt += 1), timeout)
    }
  }

  private async addOnBrokerAndUpdateEvent() {
    const eventData = JSON.parse(this.outboxEvent.event_data)

    this.addOnQueue(eventData)

    if (AppManager.getInstance().breakWorker()) {
      this.logger.error('Worker broke')

      throw new AppManagerError()
    }

    await this.db
      .updateTable('outbox_events')
      .set({
        published: true
      })
      .where('id', '=', this.outboxEvent.id)
      .executeTakeFirst()

    return
  }

  protected async onMaxRetries(e: unknown) {
    this.logger.error(
      `Max retries reached for event: ${this.outboxEvent.id} publishing on DLQ`
    )

    const command = new HandlePublishFailureCommand(
      this.outboxEvent,
      this.db,
      e
    )

    await command.execute()
  }

  private addOnQueue(event: OutboxEventData) {
    if (!AppManager.getInstance().duplicateEvents) {
      this.queue.add(event)

      return
    }

    this.queue.add(event)
    this.queue.add(event)
  }
}
