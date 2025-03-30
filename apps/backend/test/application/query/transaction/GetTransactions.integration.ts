import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { GetTransactions } from '../../../../src/application/query/transaction/GetTransactions.ts';
import { TestDataHelper } from '../../../helper/TestDataHelper.ts';
import { IntegrationTestLayer } from '../../../helper/TestLayers.ts';
import TestQueries from '../../../helper/TestQueries.ts';

Deno.test('GetTransactions Integration', async (t) => {
  const accountId = randomUUID();
  const categoryId = randomUUID();

  let testDataHelper: Effect.Effect.Success<typeof TestDataHelper>;
  let handler: Effect.Effect.Success<typeof GetTransactions>;

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        handler = yield* GetTransactions;
        testDataHelper = yield* TestDataHelper;
      }).pipe(
        Effect.provide(GetTransactions.Live),
        Effect.provide(IntegrationTestLayer),
      ),
    );

    await testDataHelper.createAccount(accountId);
    await testDataHelper.createCategory(categoryId, `Test Category ${categoryId.slice(0, 8)}`);
    for (let i = 0; i < 3; i++) {
      await testDataHelper.createTransaction(randomUUID(), accountId, i % 2 === 0 ? categoryId : undefined);
    }
  });

  await t.step('should get transactions successfully', async () => {
    const query = TestQueries.getTransactions({ accountId });
    const result = await Effect.runPromise(handler(query));

    assertEquals(result.total, 3);
    assertEquals(result.items.length, 3);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);
    result.items.forEach((tx) => assertEquals(tx.accountId, accountId));
  });

  await t.step('should filter by category', async () => {
    const query = TestQueries.getTransactions({ accountId, categoryId });
    const result = await Effect.runPromise(handler(query));

    assertEquals(result.total, 2);
    assertEquals(result.items.length, 2);
    result.items.forEach((tx) => assertEquals(tx.categoryId, categoryId));
  });

  await t.step('should handle pagination', async () => {
    const query = TestQueries.getTransactions({ accountId, page: '2', pageSize: '2' });
    const result = await Effect.runPromise(handler(query));

    assertEquals(result.total, 3);
    assertEquals(result.items.length, 1);
    assertEquals(result.page, 2);
    assertEquals(result.pageSize, 2);
  });

  await t.step('cleanup', () => testDataHelper.cleanup([accountId], [categoryId]));
});
