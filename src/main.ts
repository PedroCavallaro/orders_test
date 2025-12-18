import { NestFactory } from '@nestjs/core'
import { DatabaseProvider } from 'common/db/module'
import { Queue } from 'common/queue/queue'
import { OutboxConsumer } from 'consumer/consumer'
import { OutboxWorker } from 'worker/worker'
import { AppModule } from './app.module'
import { OutboxEventData } from './entities'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3000)
}

const queue = new Queue<OutboxEventData>()

const worker = new OutboxWorker(DatabaseProvider.getInstance(), queue)
const consumer = new OutboxConsumer(DatabaseProvider.getInstance(), queue)

bootstrap()
worker.start()
consumer.start()
