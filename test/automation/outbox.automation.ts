import { DatabaseProvider, OutboxEventEntity } from 'common/db'

export async function getOutboxEvent(orderId: string) {
  const db = DatabaseProvider.getInstance()

  return await db
    .selectFrom('outbox_events')
    .selectAll()
    .where('order_id', '=', orderId)
    .executeTakeFirst()
}

export async function addRawOutboxEvent(
  outboxEvent?: Partial<OutboxEventEntity>
) {
  const db = DatabaseProvider.getInstance()

  return await db
    .insertInto('outbox_events')
    .values({
      id: outboxEvent?.id ?? crypto.randomUUID(),
      order_id: outboxEvent?.order_id ?? crypto.randomUUID(),
      dead: outboxEvent?.dead ?? false,
      event_data:
        outboxEvent?.event_data ??
        '{"eventId":"54c8a9b4-8f5b-4d2d-8406-9b68737fec9f","eventType":"OrderPaid","orderId":"930ff914-c774-4420-87f1-70f28b691fc5","amount":1659,"occurredAt":"2025-12-19T01:11:08.192Z","idempotencyKey":"930ff914-c774-4420-87f1-70f28b691fc5-OrderPaid"}',
      published: outboxEvent?.published ?? false
    })
    .returningAll()
    .executeTakeFirst()
}
