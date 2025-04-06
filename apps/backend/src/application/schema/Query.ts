import { AccountPage } from '@shared/schema/Account.ts';
import { AccountHistory } from '@shared/schema/AccountHistory.ts';
import { CategoryPage } from '@shared/schema/Category.ts';
import { CategoryHistory } from '@shared/schema/CategoryHistory.ts';
import { NetWorth } from '@shared/schema/NetWorth.ts';
import { TransactionPage } from '@shared/schema/Transaction.ts';
import { Schema } from 'effect';
import { GetAccountHistoryQuery, GetAccountsQuery } from '../../domain/account/queries.ts';
import { GetCategoriesQuery, GetCategoryHistoryQuery } from '../../domain/category/queries.ts';
import { GetNetWorthQuery } from '../../domain/networth/queries.ts';
import { GetTransactionsQuery } from '../../domain/transaction/queries.ts';

export type Query = typeof Query.Type;
export const Query = Schema.Union(
  GetAccountsQuery,
  GetAccountHistoryQuery,
  GetCategoriesQuery,
  GetCategoryHistoryQuery,
  GetTransactionsQuery,
  GetNetWorthQuery,
);

export type QueryResponse = typeof QueryResponse.Type;
export const QueryResponse = Schema.Union(
  AccountPage,
  AccountHistory,
  CategoryPage,
  CategoryHistory,
  TransactionPage,
  NetWorth,
);
