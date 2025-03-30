import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { GetTransactions } from '../../../../src/application/query/transaction/GetTransactions.ts';
import { TransactionRepository } from '../../../../src/domain/transaction/TransactionRepository.ts';
import TestAggregates from '../../../helper/TestAggregates.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';
import TestQueries from '../../../helper/TestQueries.ts';

const accountId = randomUUID();
const categoryId = randomUUID();
const mockTransactions = [
  TestAggregates.transaction({ accountId, amount: 1000 }),
  TestAggregates.transaction({ accountId, amount: -50 }),
];

const TestTransactionRepository = Layer.succeed(
  TransactionRepository,
  {
    findById: () => Effect.fail(new Error('Not implemented')),
    save: () => Effect.fail(new Error('Not implemented')),
    findTransactions: () => Effect.succeed({ items: mockTransactions, total: 2, page: 1, pageSize: 10 }),
  },
);

Deno.test('GetTransactions', async (t) => {
  const getTransactions = await GetTransactions.pipe(
    Effect.provide(GetTransactions.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestTransactionRepository),
    Effect.runPromise,
  );

  await t.step('should return transactions for an account', async () => {
    const result = await Effect.runPromise(getTransactions(TestQueries.getTransactions({
      accountId,
      categoryId,
      page: '1',
      pageSize: '10',
      dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
    })));

    assertEquals(result.items.length, 2);
    assertEquals(result.total, 2);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    const tx1 = result.items[0];
    assertEquals(tx1.accountId, accountId);
    assertEquals(tx1.amount.amount, 1000);

    const tx2 = result.items[1];
    assertEquals(tx2.accountId, accountId);
    assertEquals(tx2.amount.amount, -50);
  });
});
