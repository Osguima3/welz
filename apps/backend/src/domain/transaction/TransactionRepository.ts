import { Transaction, TransactionPage } from '@shared/schema/Transaction.ts';
import { Context, Effect } from 'effect';
import { DateRange } from '../common/DateRange.ts';

export interface FindTransactionsOptions {
  accountId?: string;
  categoryId?: string;
  dateRange?: DateRange;
  page?: number;
  pageSize?: number;
}

export class TransactionRepository extends Context.Tag('TransactionRepository')<
  TransactionRepository,
  {
    findById(id: string): Effect.Effect<Transaction, Error>;
    findTransactions(options: FindTransactionsOptions): Effect.Effect<TransactionPage, Error>;
    save(transaction: Transaction): Effect.Effect<Transaction, Error>;
  }
>() {}
