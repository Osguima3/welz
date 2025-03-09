import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { GetAccountTransactions } from '../../../../src/application/query/transaction/GetAccountTransactions.ts';
import { TransactionRepository } from '../../../../src/domain/transaction/TransactionRepository.ts';
import * as TestAggregates from '../../../helper/TestAggregates.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';
import * as TestQueries from '../../../helper/TestQueries.ts';

const accountId = randomUUID();
const mockTransactions = [
  TestAggregates.transaction({ accountId, amount: 1000 }),
  TestAggregates.transaction({ accountId, amount: -50 }),
];

const TestTransactionRepository = Layer.succeed(
  TransactionRepository,
  {
    findById: () => Effect.fail(new Error('Not implemented')),
    save: () => Effect.fail(new Error('Not implemented')),
    findTransactions: () => Effect.succeed({ transactions: mockTransactions, total: 2, page: 1, pageSize: 10 }),
  },
);

Deno.test('GetAccountTransactions', async (t) => {
  const getTransactions = await GetAccountTransactions.pipe(
    Effect.provide(GetAccountTransactions.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestTransactionRepository),
    Effect.runPromise,
  );

  await t.step('should return transactions for an account', async () => {
    const result = await Effect.runPromise(getTransactions(TestQueries.getAccountTransactions({ accountId })));

    assertEquals(result.transactions.length, 2);
    assertEquals(result.total, 2);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    const tx1 = result.transactions[0];
    assertEquals(tx1.accountId, accountId);
    assertEquals(tx1.amount.amount, 1000);

    const tx2 = result.transactions[1];
    assertEquals(tx2.accountId, accountId);
    assertEquals(tx2.amount.amount, -50);
  });
});
