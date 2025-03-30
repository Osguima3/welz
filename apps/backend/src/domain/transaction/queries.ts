import { Schema } from 'effect';

export type GetTransactionsQuery = typeof GetTransactionsQuery.Type;
export const GetTransactionsQuery = Schema.Struct({
  type: Schema.Literal('GetTransactions'),
  accountId: Schema.optional(Schema.UUID),
  categoryId: Schema.optional(Schema.UUID),
  start: Schema.optional(Schema.Date),
  end: Schema.optional(Schema.Date),
  page: Schema.optional(Schema.NumberFromString),
  pageSize: Schema.optional(Schema.NumberFromString),
});
