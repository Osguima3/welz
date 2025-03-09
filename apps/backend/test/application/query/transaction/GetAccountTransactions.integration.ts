import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { GetAccountTransactions } from '../../../../src/application/query/transaction/GetAccountTransactions.ts';
import { TestDataHelper } from '../../../helper/TestDataHelper.ts';
import { IntegrationTestLayer } from '../../../helper/TestLayers.ts';
import * as TestQueries from '../../../helper/TestQueries.ts';

Deno.test('GetAccountTransactions Integration', async (t) => {
  const accountId = randomUUID();
  const categoryId = randomUUID();

  let testDataHelper: Effect.Effect.Success<typeof TestDataHelper>;
  let handler: Effect.Effect.Success<typeof GetAccountTransactions>;

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        handler = yield* GetAccountTransactions;
        testDataHelper = yield* TestDataHelper;
      }).pipe(
        Effect.provide(GetAccountTransactions.Live),
        Effect.provide(IntegrationTestLayer),
      ),
    );

    await testDataHelper.createAccount(accountId);
    await testDataHelper.createCategory(categoryId);

    // Create some test transactions
    for (let i = 0; i < 3; i++) {
      await testDataHelper.createTransaction(randomUUID(), accountId, i % 2 === 0 ? categoryId : undefined);
    }
  });

  await t.step('should get transactions successfully', async () => {
    const query = TestQueries.getAccountTransactions({ accountId });
    const result = await Effect.runPromise(handler(query));

    assertEquals(result.total, 3);
    assertEquals(result.transactions.length, 3);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);
    result.transactions.forEach((tx: { accountId: string }) => {
      assertEquals(tx.accountId, accountId);
    });
  });

  await t.step('should filter by category', async () => {
    const query = TestQueries.getAccountTransactions({ accountId, categoryId });
    const result = await Effect.runPromise(handler(query));

    assertEquals(result.total, 2);
    assertEquals(result.transactions.length, 2);
    result.transactions.forEach((tx) => assertEquals(tx.categoryId, categoryId));
  });

  await t.step('should handle pagination', async () => {
    const query = TestQueries.getAccountTransactions({ accountId, page: 2, pageSize: 2 });
    const result = await Effect.runPromise(handler(query));

    assertEquals(result.total, 3);
    assertEquals(result.transactions.length, 1);
    assertEquals(result.page, 2);
    assertEquals(result.pageSize, 2);
  });

  await t.step('cleanup', () => testDataHelper.cleanup([accountId], [categoryId]));
});
