import { ColumnType, Generated, Selectable } from 'kysely'

export interface OutboxEventEntity {
  id: string
  event_data: string
  published: Generated<boolean>
  ocurred_at: ColumnType<Date, string | undefined, never>
}

export type OutboxEvent = Selectable<OutboxEventEntity>
