import { randomUUID } from 'node:crypto';

export function createTestCreateTransactionCommand(accountId = randomUUID()) {
  return {
    type: 'CreateTransaction' as const,
    accountId,
    amount: {
      amount: '1000',
      currency: 'EUR',
    },
    date: new Date(),
    description: 'Test transaction',
  };
}