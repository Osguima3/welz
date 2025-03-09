import { Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { GetAccountTransactionsQuery } from '../../src/domain/transaction/queries.ts';

export interface GetAccountTransactionsParams {
  accountId: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function getAccountTransactionsRequest(params: GetAccountTransactionsParams) {
  return {
    type: 'GetAccountTransactions',
    ...params,
    accountId: params.accountId ?? randomUUID(),
  };
}

export function getAccountTransactions(params: GetAccountTransactionsParams) {
  return Schema.decodeUnknownSync(GetAccountTransactionsQuery)(
    getAccountTransactionsRequest(params),
  );
}
