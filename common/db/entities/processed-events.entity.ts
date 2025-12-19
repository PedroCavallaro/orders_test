import { Selectable } from 'kysely'

export interface ProcessedEventsEntity {
  event_key: string
  processed_at?: Date
  queue_attempts: number
}

export type ProcessedEvents = Selectable<ProcessedEventsEntity>
