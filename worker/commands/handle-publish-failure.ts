import { DatabaseProvider, OutboxEvent } from 'common/db'
import { Queue } from 'common/queue'
import { OutboxEventFailure } from 'src/entities'

export class HandlePublishFailureCommand {
  private readonly queue = new Queue<OutboxEventFailure>()

  constructor(
    private readonly outboxEvent: OutboxEvent,
    private readonly db: DatabaseProvider,
    private readonly failureReason: unknown
  ) {}

  async execute() {
    await this.db
      .updateTable('outbox_events')
      .set({
        dead: true
      })
      .where('id', '=', this.outboxEvent.id)
      .execute()

    this.queue.add({ ...this.outboxEvent, failureReason: this.failureReason })
  }
}
