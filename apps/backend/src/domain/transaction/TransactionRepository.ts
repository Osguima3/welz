import { Context, Effect } from 'effect';
import { TransactionAggregate } from './Transaction.ts';

export interface FindTransactionsOptions {
  accountId: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export interface TransactionPage {
  transactions: TransactionAggregate[];
  total: number;
  page: number;
  pageSize: number;
}

export class TransactionRepository extends Context.Tag('TransactionRepository')<
  TransactionRepository,
  {
    findById(id: string): Effect.Effect<TransactionAggregate, Error>;
    findTransactions(options: FindTransactionsOptions): Effect.Effect<TransactionPage, Error>;
    save(transaction: TransactionAggregate): Effect.Effect<TransactionAggregate, Error>;
  }
>() {}
