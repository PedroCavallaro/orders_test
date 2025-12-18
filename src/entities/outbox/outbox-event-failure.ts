import { OutboxEvent } from 'common/db'

export interface OutboxEventFailure extends OutboxEvent {
  failureReason: unknown
}
