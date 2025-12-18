import { OutboxEvent } from 'common'
import { DatabaseProvider } from 'common/db/module'
import { Queue } from 'common/queue/queue'

export class PublishOrderCommand {
  constructor(
    private readonly outboxEvent: OutboxEvent,
    private readonly db: DatabaseProvider,
    private readonly queue: Queue<OutboxEvent>
  ) {}

  async execute() {
    this.queue.add(this.outboxEvent)
  }
}
