import { AccountType } from '@shared/schema/Account.ts';
import { CategoryType } from '@shared/schema/Category.ts';
import { UUID } from '@shared/schema/UUID.ts';
import { Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { GetAccountsQuery } from '../../src/domain/account/queries.ts';
import { GetCategoriesQuery } from '../../src/domain/category/queries.ts';
import { GetNetWorthQuery } from '../../src/domain/networth/queries.ts';
import { GetTransactionsQuery } from '../../src/domain/transaction/queries.ts';

interface GetAccountsParams {
  accountType?: AccountType;
  page?: string;
  pageSize?: string;
}

function getAccountsRequest(params: GetAccountsParams = {}) {
  return { type: 'GetAccounts', ...params };
}

function getAccounts(params: GetAccountsParams = {}) {
  return Schema.decodeUnknownSync(GetAccountsQuery)(getAccountsRequest(params));
}

interface GetTransactionsParams {
  accountId: UUID;
  categoryId?: UUID;
  page?: string;
  pageSize?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

function getTransactionsRequest(params: GetTransactionsParams) {
  return { type: 'GetTransactions', ...params, accountId: params.accountId ?? randomUUID() };
}

function getTransactions(params: GetTransactionsParams) {
  return Schema.decodeUnknownSync(GetTransactionsQuery)(getTransactionsRequest(params));
}

interface GetCategoriesParams {
  categoryType?: CategoryType;
  page?: string;
  pageSize?: string;
}

function getCategoriesRequest(params: GetCategoriesParams = {}) {
  return { type: 'GetCategories', ...params };
}

function getCategories(params: GetCategoriesParams = {}) {
  return Schema.decodeUnknownSync(GetCategoriesQuery)(getCategoriesRequest(params));
}

interface GetNetWorthParams {
  maxCategories?: string;
}

function getNetWorthRequest(params: GetNetWorthParams = {}) {
  return { type: 'GetNetWorth', ...params };
}

function getNetWorth(params: GetNetWorthParams = {}) {
  return Schema.decodeUnknownSync(GetNetWorthQuery)(getNetWorthRequest(params));
}

export default {
  getAccountsRequest,
  getAccounts,
  getTransactionsRequest,
  getTransactions,
  getCategoriesRequest,
  getCategories,
  getNetWorthRequest,
  getNetWorth,
};
