import { DatabaseProvider, ProcessedEvents } from 'common/db'

export async function addRawProcessedEvent(event?: Partial<ProcessedEvents>) {
  const db = DatabaseProvider.getInstance()

  return await db
    .insertInto('processed_events')
    .values({
      event_key: event?.event_key ?? crypto.randomUUID(),
      queue_attempts: event?.queue_attempts ?? 0
    })
    .returningAll()
    .executeTakeFirst()
}

export async function getProcessedEvent(eventKey: string) {
  const db = DatabaseProvider.getInstance()

  return await db
    .selectFrom('processed_events')
    .selectAll()
    .where('event_key', '=', eventKey)
    .executeTakeFirst()
}
