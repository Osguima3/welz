import { Schema } from 'effect';
import { AccountPage } from '../../../../shared/schema/Account.ts';
import { CategoryPage } from '../../../../shared/schema/Category.ts';
import { TransactionPage } from '../../../../shared/schema/Transaction.ts';
import { GetAccountsQuery } from '../../domain/account/queries.ts';
import { GetCategoriesQuery } from '../../domain/category/queries.ts';
import { GetTransactionsQuery } from '../../domain/transaction/queries.ts';

export type Query = typeof Query.Type;
export const Query = Schema.Union(
  GetAccountsQuery,
  GetCategoriesQuery,
  GetTransactionsQuery,
);

export type QueryResponse = typeof QueryResponse.Type;
export const QueryResponse = Schema.Union(
  AccountPage,
  CategoryPage,
  TransactionPage,
);
