import { ColumnType, Selectable } from 'kysely'

export interface OutboxEventEntity {
  id: string
  event_data: string
  published: boolean
  dead: boolean
  order_id: string
  created_at: ColumnType<Date, string | undefined, never>
}

export type OutboxEvent = Selectable<OutboxEventEntity>
