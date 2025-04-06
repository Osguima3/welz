import { UUID } from '@shared/schema/UUID.ts';
import { Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { CategorizeTransactionCommand, CreateTransactionCommand } from '../../src/domain/transaction/commands.ts';

function createTransactionRequest(accountId: UUID = randomUUID(), categoryId: UUID | undefined = undefined) {
  return {
    type: 'CreateTransaction',
    accountId,
    categoryId,
    amount: { amount: 1000, currency: 'EUR' },
    date: new Date().toISOString(),
    description: 'Test transaction',
  };
}

function createTransaction(accountId: UUID = randomUUID(), categoryId: UUID | undefined = undefined) {
  return Schema.decodeUnknownSync(CreateTransactionCommand)(
    createTransactionRequest(accountId, categoryId),
  );
}

function categorizeTransactionRequest(
  transactionId: UUID = randomUUID(),
  categoryId: UUID = randomUUID(),
) {
  return {
    type: 'CategorizeTransaction',
    transactionId,
    categoryId,
  };
}

function categorizeTransaction(transactionId: UUID = randomUUID(), categoryId: UUID = randomUUID()) {
  return Schema.decodeUnknownSync(CategorizeTransactionCommand)(
    categorizeTransactionRequest(transactionId, categoryId),
  );
}

export default {
  createTransactionRequest,
  createTransaction,
  categorizeTransactionRequest,
  categorizeTransaction,
};
