import { Schema } from 'effect';
import { AccountType } from '../../../../shared/schema/Account.ts';

export type GetAccountsQuery = typeof GetAccountsQuery.Type;
export const GetAccountsQuery = Schema.Struct({
  type: Schema.Literal('GetAccounts'),
  accountType: Schema.optional(AccountType),
  page: Schema.optional(Schema.NumberFromString),
  pageSize: Schema.optional(Schema.NumberFromString),
});
