import { Selectable } from 'kysely'

export interface ProcessedEventsEntity {
  event_key: string
  processed_at?: Date
}

export type ProcessedEvents = Selectable<ProcessedEventsEntity>
