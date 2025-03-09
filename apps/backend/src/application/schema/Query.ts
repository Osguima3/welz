import { Schema } from 'effect';
import { GetAccountTransactionsQuery } from '../../domain/transaction/queries.ts';

export type Query = typeof Query.Type;
export const Query = Schema.Union(
  // GetAccountBalancesQuery,
  GetAccountTransactionsQuery,
  // GetNetWorthHistoryQuery,
  // GetCategorySpendingQuery,
);
