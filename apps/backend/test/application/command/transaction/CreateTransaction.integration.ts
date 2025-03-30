import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { CreateTransaction } from '../../../../src/application/command/transaction/CreateTransaction.ts';
import TestCommands from '../../../helper/TestCommands.ts';
import { TestDataHelper } from '../../../helper/TestDataHelper.ts';
import { IntegrationTestLayer } from '../../../helper/TestLayers.ts';

Deno.test('CreateTransaction Integration', async (t) => {
  const accountId = randomUUID();
  const categoryId = randomUUID();

  let testDataHelper: Effect.Effect.Success<typeof TestDataHelper>;
  let handler: Effect.Effect.Success<typeof CreateTransaction>;

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        testDataHelper = yield* TestDataHelper;
        handler = yield* CreateTransaction;
      }).pipe(
        Effect.provide(CreateTransaction.Live),
        Effect.provide(IntegrationTestLayer),
      ),
    );

    await testDataHelper.createAccount(accountId);
    await testDataHelper.createCategory(categoryId, `Test Category ${categoryId.slice(0, 8)}`);
  });

  await t.step('should create transaction successfully', async () => {
    const transaction = TestCommands.createTransaction(accountId);

    const result = await Effect.runPromise(handler(transaction));

    const ignoredFields = {
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      type: undefined,
      date: undefined,
      categoryId: undefined,
    };
    assertEquals({ ...result, ...ignoredFields }, { ...transaction, ...ignoredFields });
  });

  await t.step('should create transaction with category successfully', async () => {
    const transaction = TestCommands.createTransaction(accountId, categoryId);

    const result = await Effect.runPromise(handler(transaction));

    const ignoredFields = {
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      type: undefined,
      date: undefined,
    };
    assertEquals({ ...result, ...ignoredFields }, { ...transaction, ...ignoredFields });
  });

  await t.step('cleanup', () => testDataHelper.cleanup([accountId], [categoryId]));
});
