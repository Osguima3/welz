import { Schema } from 'effect';
import { AccountPage } from '../../../../shared/schema/Account.ts';
import { AccountHistory } from '../../../../shared/schema/AccountHistory.ts';
import { CategoryPage } from '../../../../shared/schema/Category.ts';
import { NetWorth } from '../../../../shared/schema/NetWorth.ts';
import { TransactionPage } from '../../../../shared/schema/Transaction.ts';
import { GetAccountHistoryQuery, GetAccountsQuery } from '../../domain/account/queries.ts';
import { GetCategoriesQuery } from '../../domain/category/queries.ts';
import { GetNetWorthQuery } from '../../domain/networth/queries.ts';
import { GetTransactionsQuery } from '../../domain/transaction/queries.ts';

export type Query = typeof Query.Type;
export const Query = Schema.Union(
  GetAccountsQuery,
  GetAccountHistoryQuery,
  GetCategoriesQuery,
  GetTransactionsQuery,
  GetNetWorthQuery,
);

export type QueryResponse = typeof QueryResponse.Type;
export const QueryResponse = Schema.Union(
  AccountPage,
  AccountHistory,
  CategoryPage,
  TransactionPage,
  NetWorth,
);
