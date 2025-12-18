import { Logger } from '@nestjs/common'
import { OutboxEvent } from 'common'
import { Queue } from 'common/queue/queue'
import { sleep } from 'common/utils'

export class OutboxConsumer {
  private readonly logger = new Logger(OutboxConsumer.name)

  constructor(private readonly ordersQueue: Queue<OutboxEvent>) {}

  async start() {
    while (true) {
      const order = this.ordersQueue.pop()

      if (!order) {
        await sleep(30)

        continue
      }

      this.logger.debug(`Consuming order, event: ${order!.id}`)
    }
  }
}
