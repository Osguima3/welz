import { randomUUID } from 'node:crypto';
import { Money } from '../../src/domain/common/Money.ts';
import { TransactionAggregate } from '../../src/domain/transaction/Transaction.ts';

export interface BuildTransactionOptions {
  id?: string;
  accountId?: string;
  amount?: number;
}

export function transaction(options: BuildTransactionOptions = {}): TransactionAggregate {
  const now = new Date();
  return TransactionAggregate.make({
    id: options.id ?? randomUUID(),
    accountId: options.accountId ?? randomUUID(),
    amount: Money.create(options.amount ?? 1000, 'EUR'),
    date: now,
    description: 'Test transaction',
    categoryId: undefined,
    createdAt: now,
    updatedAt: now,
  });
}
