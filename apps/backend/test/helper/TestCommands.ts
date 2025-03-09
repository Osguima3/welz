import { Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { CategorizeTransactionCommand, CreateTransactionCommand } from '../../src/domain/transaction/commands.ts';

export function createTransactionRequest(accountId = randomUUID()) {
  return {
    type: 'CreateTransaction',
    accountId,
    amount: { amount: 1000, currency: 'EUR' },
    date: new Date().toISOString(),
    description: 'Test transaction',
  };
}

export function categorizeTransactionRequest(
  transactionId = randomUUID(),
  categoryId = randomUUID(),
) {
  return {
    type: 'CategorizeTransaction',
    transactionId,
    categoryId,
  };
}

export function createTransaction(accountId = randomUUID()) {
  return Schema.decodeUnknownSync(CreateTransactionCommand)(
    createTransactionRequest(accountId),
  );
}

export function categorizeTransaction(transactionId = randomUUID(), categoryId = randomUUID()) {
  return Schema.decodeUnknownSync(CategorizeTransactionCommand)(
    categorizeTransactionRequest(transactionId, categoryId),
  );
}
