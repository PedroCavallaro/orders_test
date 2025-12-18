import { ColumnType, Generated, Selectable } from 'kysely'
import { OrderStatus } from '../enum'

export interface OrderEntity {
  id: Generated<string>
  status: OrderStatus
  amount: string
  created_at: ColumnType<Date, string | undefined, never>
}

export type Order = Selectable<OrderEntity>
