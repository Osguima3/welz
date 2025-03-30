import { assertEquals, assertStringIncludes } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { TransactionManager } from '../../../../src/application/command/TransactionManager.ts';
import { CategorizeTransaction } from '../../../../src/application/command/transaction/CategorizeTransaction.ts';
import { TransactionRepository } from '../../../../src/domain/transaction/TransactionRepository.ts';
import TestCommands from '../../../helper/TestCommands.ts';
import { TestDataHelper } from '../../../helper/TestDataHelper.ts';
import { IntegrationTestLayer } from '../../../helper/TestLayers.ts';

Deno.test('CategorizeTransaction Integration', async (t) => {
  const transactionId = randomUUID();
  const nonExistentTransactionId = randomUUID();
  const accountId = randomUUID();
  const categoryId = randomUUID();
  const secondCategoryId = randomUUID();

  let testDataHelper: Effect.Effect.Success<typeof TestDataHelper>;
  let repository: Effect.Effect.Success<typeof TransactionRepository>;
  let handler: Effect.Effect.Success<typeof CategorizeTransaction>;
  let transactionManager: Effect.Effect.Success<typeof TransactionManager>;

  function runTransaction<T>(operation: Effect.Effect<T, Error>): Promise<T> {
    return Effect.runPromise(transactionManager(true, () => operation));
  }

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        testDataHelper = yield* TestDataHelper;
        repository = yield* TransactionRepository;
        handler = yield* CategorizeTransaction;
        transactionManager = yield* TransactionManager;
      }).pipe(
        Effect.provide(CategorizeTransaction.Live),
        Effect.provide(IntegrationTestLayer),
      ),
    );

    await testDataHelper.createAccount(accountId);
    await testDataHelper.createCategory(categoryId, 'Test Category 1');
    await testDataHelper.createCategory(secondCategoryId, 'Test Category 2');
    await testDataHelper.createTransaction(transactionId, accountId);
  });

  await t.step('should categorize transaction successfully', async () => {
    const command = TestCommands.categorizeTransaction(transactionId, categoryId);

    const result = await Effect.runPromise(handler(command));

    assertEquals(result.categoryId, categoryId);

    const updatedTransaction = await runTransaction(repository.findById(transactionId));
    assertEquals(updatedTransaction.categoryId, categoryId);
  });

  await t.step('should update transaction category when already categorized', async () => {
    const updateCommand = TestCommands.categorizeTransaction(transactionId, secondCategoryId);

    const result = await Effect.runPromise(handler(updateCommand));

    assertEquals(result.categoryId, secondCategoryId);

    const updatedTransaction = await runTransaction(repository.findById(transactionId));
    assertEquals(updatedTransaction.categoryId, secondCategoryId);
  });

  await t.step('should fail when transaction does not exist', async () => {
    const command = TestCommands.categorizeTransaction(nonExistentTransactionId, categoryId);

    const error = await Effect.runPromise(handler(command).pipe(Effect.flip));

    assertStringIncludes(error.message, 'Transaction not found');
  });

  await t.step('cleanup', () => testDataHelper.cleanup([accountId], [categoryId, secondCategoryId]));
});
