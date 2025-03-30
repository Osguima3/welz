import { Schema } from 'effect';
import { AccountType } from '../../../../shared/schema/Account.ts';

export type GetAccountsQuery = typeof GetAccountsQuery.Type;
export const GetAccountsQuery = Schema.Struct({
  type: Schema.Literal('GetAccounts'),
  accountType: Schema.optional(AccountType),
  page: Schema.optional(Schema.NumberFromString),
  pageSize: Schema.optional(Schema.NumberFromString),
});

export type GetAccountHistoryQuery = typeof GetAccountHistoryQuery.Type;
export const GetAccountHistoryQuery = Schema.Struct({
  type: Schema.Literal('GetAccountHistory'),
  accountId: Schema.optional(Schema.UUID),
  start: Schema.optional(Schema.Date),
  end: Schema.optional(Schema.Date),
});
