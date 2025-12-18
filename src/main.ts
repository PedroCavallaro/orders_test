import { NestFactory } from '@nestjs/core'
import { OutboxEvent } from 'common'
import { DatabaseProvider } from 'common/db/module'
import { Queue } from 'common/queue/queue'
import { OutboxConsumer } from 'consumer/consumer'
import { OutboxWorker } from 'worker/worker'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3000)
}

const queue = new Queue<OutboxEvent>()

const worker = new OutboxWorker(DatabaseProvider.getInstance(), queue)
const consumer = new OutboxConsumer(queue)

bootstrap()
consumer.start()
worker.start()
