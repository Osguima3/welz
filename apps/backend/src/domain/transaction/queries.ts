import { Schema } from 'effect';
import { DateRange } from '../readmodel/queries.ts';

export type GetAccountTransactionsQuery = typeof GetAccountTransactionsQuery.Type;
export const GetAccountTransactionsQuery = Schema.Struct({
  type: Schema.Literal('GetAccountTransactions'),
  accountId: Schema.UUID,
  dateRange: Schema.optional(DateRange),
  categoryId: Schema.optional(Schema.UUID),
  page: Schema.optional(Schema.Number),
  pageSize: Schema.optional(Schema.Number),
});
