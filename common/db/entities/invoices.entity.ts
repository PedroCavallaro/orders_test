import { ColumnType, Generated } from 'kysely'

export interface InvoiceEntity {
  id: Generated<string>
  order_id: string
  amount: string
  created_at: ColumnType<Date, string | undefined, never>
}
