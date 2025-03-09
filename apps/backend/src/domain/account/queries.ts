import { Schema } from 'effect';
import { Currency } from '../common/Currency.ts';

export type GetAccountBalancesQuery = typeof GetAccountBalancesQuery.Type;
export const GetAccountBalancesQuery = Schema.Struct({
  type: Schema.Literal('GetAccountBalances'),
  currency: Schema.optional(Currency),
});
